# Scheduled prompts and command queue

This document explains how the extracted Copilot CLI bundle implements scheduled prompts and queued command dispatch. In the analyzed `app.js`, `/every` and `/after` are user-visible slash commands backed by an in-session `ScheduleRegistry`, while `command.queued`, `command.execute`, and `command.completed` are ephemeral client-dispatch events used to route slash commands to the correct interactive/protocol owner.

The key distinction is:

- **Scheduled entries** enqueue either a normal user message or a slash command on a timer.
- **Queued commands** ask a UI/protocol client to execute or route slash-command text. Since `1.0.62`, `/every` and `/after` can create this kind of scheduled entry directly.

Because `app.js` is bundled/minified, symbol names are unstable. Line references below are searchable anchors in the extracted bundle and will shift across releases.

## Source anchors

| Semantic alias | Minified anchor | Approx. `app.js` line | Role |
|---|---|---:|---|
| Slash commands | `/every`, `/after`, `YBn(...)` | 1303, 1340 | User-visible recurring and one-shot scheduled prompt commands. |
| Schedule validation | `Invalid interval`, `Minimum interval`, `Maximum interval`, `J7n=1e4`, `Z7n=864e5` | 4210 | Intervals are parsed and bounded between 10 seconds and 1 day. |
| Scheduled command dispatch | `session.commands.enqueue`, `session.commands.execute` | 167, 2651 | Scheduled slash commands enter the same client-mediated command queue as manually queued commands. |
| Registry class | `ScheduleRegistry`, minified `Sbt` | 4210 | Stores entries, hydrates from events, schedules timers, and disposes on shutdown. |
| Create/cancel events | `session.schedule_created`, `session.schedule_cancelled` | 4210, 4361 | Durable session events define schedule state. |
| Session access | `getScheduleRegistry()`, session schedule API | 2650, 2710, 2755 | Registry is lazily created and reused by TUI dialogs/tools. |
| Tool API bridge | `enableManageScheduleTool`, `scheduleApi` | 4471, 4481 | Schedule management can be exposed to tools when enabled. |
| Command request queue | `command.queued`, `command.execute`, `command.completed` | 2651, 2742, 3156, 3289 | Ephemeral client command routing and completion lifecycle. |
| Queue mutation | `pending_messages.modified` | 4479 | Prompt queue changes notify the UI. |
| Cleanup | `session.shutdown` | 4210, 4361 | Schedule timers are disposed when the session shuts down. |

## User-visible scheduled prompts

The main user-facing commands are:

| Command | Description | Runtime mode |
|---|---|---|
| `/every <interval> <prompt>` | Schedule a recurring prompt for the current session. | Re-arms after each tick. |
| `/after <delay> <prompt>` | Schedule a one-shot prompt for the current session. | Fires once, then cancels itself. |

Both commands are marked experimental in the slash-command table, can run during agent execution, and do not stop queue processing.

## Parsing and validation

The shared parser (`YBn(...)` in the minified bundle) expects:

```text
/<every|after> <interval-or-delay> <prompt>
```

It performs these checks:

1. Argument text must not be empty.
2. The first non-space token is parsed as an interval/delay.
3. The rest of the input becomes the prompt text.
4. Prompt or command text must not be empty.
5. The parsed schedule must resolve to a valid future execution time.

Older builds rejected text beginning with `/`. The current runtime accepts it and records whether the entry is a normal prompt or a command so timer execution can choose the correct queue path.

## Interval limits

The interval parser accepts human-readable values such as `30s`, `5m`, `2h`, and `1d`. The `ScheduleRegistry` helper validates:

| Constant | Value | Meaning |
|---|---:|---|
| `J7n` | `10,000` ms | Minimum interval: 10 seconds. |
| `Z7n` | `86,400,000` ms | Maximum interval: 1 day. |

Invalid values produce guidance like “Try 30s, 5m, 2h, or 1d.”

## ScheduleRegistry state

Each scheduled entry has this shape:

| Field | Meaning |
|---|---|
| `id` | Sequential schedule ID within the session. |
| `intervalMs` | Delay between ticks in milliseconds. |
| `prompt` | Plain prompt text to enqueue. |
| `recurring` | `true` for `/every`, `false` for `/after`. |
| runtime-only `timer` | Active timeout handle. |
| runtime-only `cancelled` | Prevents future ticks. |
| runtime-only `inFlightCleanup` | Cleanup callback for any active queued work. |

The public/listed entry returned by `X7n(...)` omits runtime-only timer fields.

## Event-sourced hydration

The registry is event-sourced. On construction it calls `hydrate()` and replays prior session events:

| Event | Hydration effect |
|---|---|
| `session.schedule_created` | Add or update an entry in the in-memory schedule map. |
| `session.schedule_cancelled` | Remove an entry from the map. |

The registry also tracks the highest seen ID and sets `nextId = maxId + 1`. After replay, it schedules timers for all remaining entries.

This design makes scheduled prompts survive session replay/resume within the event log model without needing a separate schedules file.

### Self-paced schedule hydration

The current event schema also supports self-paced, or `dynamic`, schedules. These do not have an automatically computed fixed cadence. Their next wakeup is controlled by the model through the `manage_schedule` `wakeup` action.

| Event | Self-paced hydration effect |
|---|---|
| `session.schedule_created` with `selfPaced: true` | Creates the dynamic schedule. |
| `session.schedule_rearmed` | Stores `nextRunAt`, the model-selected epoch-millisecond wakeup. |
| `session.schedule_cancelled` | Removes the dynamic schedule and its pending wakeup. |

During replay, the registry remembers the most recent `nextRunAt` and also derives the requested delay from the rearm event timestamp. It recreates the timer for the recorded wakeup and retains that delay for recovery after an aborted scheduled turn.

## Creating and cancelling schedules

```mermaid
sequenceDiagram
    participant User
    participant Slash as /every or /after
    participant Registry as ScheduleRegistry
    participant Session

    User->>Slash: /every 5m check status
    Slash->>Registry: add("5m", "check status", recurring=true)
    Registry->>Session: emit session.schedule_created
    Registry->>Registry: scheduleNextTick(entry)
    Registry-->>Slash: entry
    Slash-->>User: Scheduled #id every 5m -> prompt
```

Cancellation uses `stop(id)`, which:

1. finds the entry;
2. cancels its timer and in-flight cleanup;
3. deletes it from the entries map;
4. emits `session.schedule_cancelled`;
5. returns the public entry snapshot.

`cancelAll()` is called by `dispose()`.

## Timer execution

At each tick, the registry branches on the scheduled text:

- plain text enters the session as a normal queued user prompt;
- text beginning with `/` enters the session command queue and is dispatched to the TUI/protocol owner of that slash command.

For recurring entries, the registry schedules the next tick unless the entry was cancelled. For one-shot entries, it cancels/removes the entry after firing. Normal prompts inherit the usual model/tool/permission behavior; commands inherit the same availability and ownership checks as manually invoked slash commands.

Timers are ordinary unreferenced JavaScript `setTimeout` handles, not an external job runner. Long waits are split at the platform timeout ceiling: when an intermediate timer fires before `nextRunAt`, `armTimer(...)` arms another timer instead of running early.

Resume behavior depends on the schedule type. Fixed interval and cron entries do not persist every intended tick; hydration calls `scheduleNextTick(...)`, which computes one future run from the current resume time and therefore skips cadences missed while the process was stopped. Self-paced entries restore their durable `nextRunAt`; if that timestamp is already past, `armTimer(...)` uses a zero-delay timer and makes that one retained wakeup eligible promptly after resume.

## Self-paced execution and rearming

A self-paced schedule fires a tagged prompt with source `schedule-<id>` and then parks: `runTick(...)` deliberately does not compute another run. The model must call `manage_schedule` with the `wakeup` action to select the next finite wakeup time. `rearmSelfPaced(...)` then:

1. verifies that the schedule still exists and is self-paced;
2. rejects a non-finite wakeup value;
3. replaces any existing timer;
4. records the non-negative requested delay;
5. emits durable `session.schedule_rearmed { id, nextRunAt }` state;
6. arms the new timer.

If a scheduled turn aborts after firing but before it re-arms itself, the registry can reuse the previously recorded delay and schedule another attempt. A self-paced entry left parked without an active timer or in-flight delivery can also be swept and cancelled, preventing an inert schedule from remaining indefinitely in the live registry.

## Shutdown behavior

The registry subscribes to `session.shutdown` in its constructor. On shutdown it calls `dispose()`, which:

- marks the registry disposed;
- cancels all timers;
- clears all entries;
- unsubscribes from the shutdown listener.

If code attempts to add an entry after disposal, it throws `ScheduleRegistry has been disposed`.

## Manage-schedule tool bridge

The session has an `enableManageScheduleTool` option. When set, the tool initialization context includes:

```text
scheduleApi: this.getScheduleRegistry()
```

This allows a tool or UI component to list/cancel/manage scheduled prompts through the registry, without duplicating schedule state.

The TUI also has a schedule manager dialog path that receives `registry: session.getScheduleRegistry()`.

## Command queue events

The command queue is related but separate from scheduled prompts. It is used when slash commands need to be executed by a UI/protocol client or routed to a command owner.

| Event | Persistence | Meaning |
|---|---|---|
| `command.queued` | Ephemeral | A queued slash command text should be handled by a client. |
| `command.execute` | Ephemeral | A registered command should be dispatched to its owning connection. |
| `command.completed` | Ephemeral | The pending command request has been resolved; clients can dismiss UI. |

The session pending-request manager stores request resolvers keyed by request ID and emits these events.

## Queued command lifecycle

```mermaid
sequenceDiagram
    participant Session
    participant Pending as PendingRequests
    participant Client as TUI / ACP / extension connection

    Session->>Pending: requestQueuedCommand(command)
    Pending-->>Client: command.queued(requestId, command)
    Client->>Client: handle slash command
    Client->>Pending: respondToQueuedCommand(requestId, result)
    Pending-->>Client: command.completed(requestId)
    Pending-->>Session: result
```

The `command.execute` path is similar but includes `commandName` and `args`, and the embedded server can route the event to the connection that owns a registered command.

## Interaction with the prompt queue

The session prompt queue emits `pending_messages.modified` whenever queued messages change. Scheduled prompts and manually submitted prompts both flow through this queue. Commands are handled specially:

- if a queued item is `kind: "command"`, the session checks whether there are `command.queued` listeners;
- if a client handles the command and requests queue processing to stop, the session clears remaining queued items;
- otherwise command execution errors are logged and queue processing continues.

This makes commands client-mediated while keeping ordinary scheduled messages inside the agent queue.

## Scheduled slash-command dispatch

Slash-command scheduling makes the feature a session-local automation surface rather than only a timed reminder. Examples include `/every 1d /chronicle standup` and other commands that declare themselves runnable while work is active.

This does not bypass command policy. The command still has to exist in the active client, pass its normal availability checks, and be accepted by the client-mediated command queue. A recurring command can therefore fail after a configuration or capability change even though its schedule remains valid.

## Relationship to other docs

- `tui-and-slash-commands.md` explains general slash-command registration and TUI dialogs.
- `session-manager-and-event-replay.md` explains event replay and session persistence.
- `built-in-tools-execution-events.md` explains tool events that scheduled prompts may later trigger.
- `autopilot-and-no-ask-user.md` explains autonomous continuation modes that scheduled prompts can interact with.
