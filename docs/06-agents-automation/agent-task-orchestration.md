# Agent and task orchestration in Copilot CLI

This addendum focuses on the deeper agent/task layer in the extracted `@github/copilot` CLI bundle. It answers the follow-up question: how does `app.js` orchestrate agents, subagents, background tasks, multi-turn agents, MCP tasks, and slash-command workflows?

The short version: the model-visible `task` tool is the main subagent router, while an internal `TaskRegistry` tracks background and multi-turn agent state. Slash commands such as `/research`, `/review`, `/subconscious run`, and `/fleet` mostly inject prompts that cause the main agent to call `task` with a specific `agent_type` or start a fleet/autopilot workflow. The dedicated built-in agent catalog is in [`built-in-agents.md`](built-in-agents.md). Memory-specific `rem-agent`, `context_board`, and sidekick behavior is covered in [`memory-and-context-board.md`](../02-context-model-loop/memory-and-context-board.md). Rate-limit recovery and model-call concurrency behavior are covered in [`resilience-rate-limits-concurrency.md`](../02-context-model-loop/resilience-rate-limits-concurrency.md).

## Source anchors

`app.js` is bundled/minified, so the documentation uses semantic aliases as the primary names and keeps generated symbols only as version-specific lookup aids for the analyzed `@github/copilot` bundle (they will shift across releases):

| Area | Semantic alias | Minified anchor | Approx. line | What it does |
|---|---|---:|---:|---|
| Hook schema | `HookSchema`, `mapHookConfig(...)` | `tLt`, `Dar(...)` | 238, 2797 | Defines and maps hooks such as `subagentStart`, `subagentStop`, and `agentStop`. |
| Feature flags | `MULTI_TURN_AGENTS`, `MCP_TASKS`, `COPILOT_SUBCONSCIOUS` | same strings | 239 | Gates multi-turn agents, MCP task support, subconscious/rem-agent, fleet-ish behavior, etc. |
| Slash commands | `autopilotCommand`, `researchCommand`, `subconsciousCommand`, `fleetCommand`, `reviewCommand` | `Rps`, `Yps`, `Wps`, `Lps`, `eLn` | 1300-1340 | Implements `/autopilot`, `/research`, `/subconscious`, `/fleet`, `/review`, etc. |
| Research prompt | `buildResearchOrchestratorPrompt(...)` | `wLn(...)` | 1346-1537 | Builds the research-orchestrator system prompt that delegates investigation to `agent_type: "research"`. |
| Custom agents | `loadCustomAgents(...)`, `loadCustomAgentMcpServers(...)`, `convertCustomAgentMcpConfig(...)` | `yar`, `xSs`, `bQn`, `gar`, `L5e` | 2789 | Loads local/plugin/remote custom agents and their MCP tools. |
| Custom agent executor | `CustomAgentExecutor` | `$vs(...)` | 3553 | Wraps a custom agent as an executable subagent/tool. |
| Task registry | `TaskRegistry` | `B3` | 3367 | Tracks agent tasks, states, message queues, progress, results, and cancellation. |
| Background launch | `launchBackgroundAgent(...)` | `Bur(...)` | 3698 | Starts a background agent through the task registry. |
| Task tool | `createTaskTool(...)`, `taskToolInputSchema`, `TASK_TOOL_NAME` | `I6n(...)`, `v6n`, `H3="task"` | 3735-3815 | Defines the `task` tool schema, instructions, dispatch callback, sync/background modes. |
| Task completion tool | `createTaskCompleteTool(...)`, `TASK_COMPLETE_TOOL_NAME`, continuation prompt | `$Vn()`, `UM="task_complete"`, `UTe`, `Dgr` | 4140-4149 | Defines the explicit main-agent completion tool, summary schema, terminal-tool instructions, and hidden continuation reminder. |
| Built-in agents | `BUILT_IN_AGENTS` | `nHn` | 4037 | Catalog of built-in agents: `explore`, `task`, `general-purpose`, `rubber-duck`, `code-review`, `research`, `rem-agent`. |
| Session subagent executor | `SessionAgentExecutor` | `dZ` | 4037-4039 | Runs built-in/session-based agents, emits subagent boundaries, applies hooks, supports multi-turn loops. |
| MCP task bridge | `doInvokeToolWithTask`, `consumeTaskStreamNonBlocking` | same names | 4138 | Converts MCP `taskSupport: "required"` tools into background `mcp-task` agent records. |
| Tool assembly | `assembleRuntimeTools(...)`, `assembleSubagentTools(...)` | `HCr(...)`, `Gjs(...)` | 5734 | Builds tool lists recursively and injects `task`, agent tools, MCP tools, skills, shell tools, etc. |
| Session runtime | `getToolConfig`, `waitForPendingBackgroundTasks` | same names | 4481-4487 | Wires hooks, task registry, MCP host, session events, and shutdown waiting. |
| Completion event emission | `tool.execution_complete`, `session.task_complete` | `ue===UM`, `emit("session.task_complete", ...)` | 4481 | Converts a `task_complete` tool execution into the durable completion event consumed by autopilot/prompt-mode loops and timeline projection. |
| Session idleness | `emitSessionIdle(...)`, `emitDeferredSessionIdleIfReady(...)`, `hasActiveBackgroundWork(...)` | same names | 4481 | Emits `session.idle` only when the foreground loop and running background agents are drained; this is not the same as task completion. |
| TUI autopilot continuation | `useAutopilotContinuation(...)` | `F5o(...)` | 6615 | Watches `session.task_complete`, `session.error`, `abort`, and `session.idle`; sends `UTe` until completion or limit. |
| Completion timeline projection | `buildTimelineEntries(...)`, task-complete renderer | `session.task_complete`, `a3o(...)`, `onTaskComplete` | 6639, 6860 | Hides the raw `task_complete` tool call and renders a `Task complete` timeline entry from the session event. |
| Prompt/autopilot | `runPromptMode(...)`, prompt-mode listeners | `u1t(...)` | 7420 | Prompt mode, `session.task_complete`, and autopilot continuation loop. |
| Detached memory agent | `spawnDetachedMemoryAgent(...)` | `T5a(...)` | 7445 | Spawns a detached `rem-agent` on shutdown when subconscious memory is enabled. |

## Big picture

```mermaid
flowchart TD
    User["User input or slash command"] --> Queue["Session message queue"]
    Queue --> MainAgent["Main agent turn"]

    MainAgent --> DirectTools["Direct tools\nview / grep / edit / shell / MCP"]
    MainAgent --> TaskTool["task tool"]
    MainAgent --> Fleet["fleet/autopilot helpers"]

    TaskTool --> Validate["Validate args\nagent_type / prompt / model / mode"]
    Validate --> BuiltIn["Built-in agent catalog"]
    Validate --> Custom["Custom agents\nlocal / plugin / remote"]
    Validate --> Registry["TaskRegistry"]

    BuiltIn --> Executor["SessionAgentExecutor"]
    Custom --> CustomExec["CustomAgentExecutor"]
    Registry --> BgAgent["Background/multi-turn agent state"]

    Executor --> Result["Subagent result"]
    CustomExec --> Result
    BgAgent --> Notify["completion / idle notifications"]
    Result --> MainAgent

    MCP["MCP tool with taskSupport: required"] --> McpBridge["MCP task bridge"]
    McpBridge --> Registry
```

The orchestration model is layered:

1. **Prompt/UI layer** — slash commands and plan/autopilot UI create ordinary prompts or mode changes.
2. **Tool layer** — the `task` tool exposes subagent dispatch to the model.
3. **Agent catalog layer** — built-in, custom, plugin, and remote agents become valid `agent_type` values.
4. **Registry layer** — `TaskRegistry` tracks background agent state, progress, messages, and cancellation.
5. **Executor layer** — session/custom/MCP executors run turns, emit events, apply hooks, and return results.

## Division of responsibility and communication

The collaboration model is intentionally hierarchical. The main agent is the planner and synthesizer; subagents are delegated workers; custom agents are specialized worker definitions that plug into the same subagent pathway.

| Participant | Primary responsibility | Communication surface | What it does not do directly |
|---|---|---|---|
| Main agent | Interpret the user request, decide whether to delegate, choose `agent_type`, provide full task context, merge returned results, and decide the final user response. | Calls the model-visible `task` tool; reads background results/notifications; can send follow-up messages to idle multi-turn agents. | It does not share live model state with a subagent. Delegation is prompt/result based, not a shared memory coroutine. |
| Built-in subagent | Execute a focused job such as exploration, command execution, review, research, or memory consolidation. | Receives a task prompt through `task`; returns a text result for sync mode, or writes status/result through `TaskRegistry` for background/multi-turn mode. | It normally does not talk to the user directly; its output is routed back through the main session. |
| Custom agent | Provide a named, user/plugin/remote-defined specialization with its own instructions, tools, MCP servers, skills, and optional model preference. | Registered in the agent catalog; selected by `agent_type`; executed through the custom-agent executor; reports through the same result and registry paths as built-ins. | It is not a separate scheduler or peer-to-peer agent network. It is a specialized implementation behind the same `task` interface. |
| Task registry | Track background and multi-turn agent records, status, message queues, latest responses, cancellation, progress, and completion. | In-process registry APIs such as start, wait, result, message, cancellation, and idle notifications. | It does not reason about tasks; it stores state and wakes waiters. |
| Hooks | Inject external policy/context and optionally block agent stop events. | `subagentStart`, `subagentStop`, and `agentStop` hooks. | Hooks are not agents; they are lifecycle callbacks around agent execution. |

```mermaid
flowchart TD
    User["User request"] --> Main["Main agent\nplanner + coordinator"]
    Main --> Decision{"delegate?"}
    Decision -->|no| Direct["Use direct tools\nand answer"]
    Decision -->|yes| Task["task tool call\nagent_type + prompt + mode"]

    Task --> Catalog["Agent catalog\nbuilt-in + custom"]
    Catalog --> BuiltIn["Built-in subagent"]
    Catalog --> Custom["Custom agent"]

    BuiltIn --> Exec["Agent executor"]
    Custom --> Exec
    Exec --> ResultPath{"mode"}
    ResultPath -->|sync| SyncResult["result text returned\ninside same tool call"]
    ResultPath -->|background| Registry["TaskRegistry\nstatus + latest response"]
    ResultPath -->|multi-turn| Queue["TaskRegistry messageQueue\nwaitForMessage / sendMessage"]

    SyncResult --> Main
    Registry --> Main
    Queue --> Main
    Main --> Final["Synthesize final response"]
```

### Sync communication

In sync mode, communication is simple and request/response shaped:

```mermaid
sequenceDiagram
    participant Main as Main agent
    participant Task as task tool
    participant Exec as Agent executor
    participant Sub as Subagent/custom agent

    Main->>Task: task({agent_type, prompt, mode: "sync"})
    Task->>Exec: executeAgent(agent_type, prompt, model override)
    Exec->>Sub: run isolated agent turn/session
    Sub-->>Exec: final response text + telemetry
    Exec-->>Task: tool result
    Task-->>Main: result text for synthesis
```

The main agent must put enough context in `prompt` because the subagent does not automatically inherit the full hidden reasoning state of the main agent. It gets runtime/session context assembled by the executor, custom-agent instructions if applicable, skills, hooks, and the explicit task prompt.

### Background communication

In background mode, the first `task` call returns quickly with an `agent_id`; subsequent coordination goes through the registry and session notifications.

```mermaid
sequenceDiagram
    participant Main as Main agent
    participant Task as task tool
    participant Registry as TaskRegistry
    participant Agent as Background subagent
    participant Session as Session event stream

    Main->>Task: task({mode: "background", agent_type, prompt})
    Task->>Registry: startAgent(...)
    Registry-->>Task: agent_id
    Task-->>Main: background started
    Registry->>Agent: run asynchronously
    Agent->>Registry: latest response / progress / terminal status
    Registry-->>Session: background-task changed / completed
    Session-->>Main: notification or readable result
```

This is the main channel for parallel work. The main agent can continue unrelated work while agents run, then read results when notified. Background agents still count against subagent concurrency limits.

### Multi-turn communication

When multi-turn agents are enabled, a background-capable agent can become idle instead of exiting after a response. At that point communication becomes mailbox-like:

```mermaid
sequenceDiagram
    participant Agent as Multi-turn agent
    participant Registry as TaskRegistry
    participant Main as Main agent

    Agent->>Registry: setLatestResponse(agent_id, response)
    Agent->>Registry: waitForMessage(agent_id)
    Registry->>Registry: status = idle, release concurrency slot
    Main->>Registry: sendMessage(agent_id, follow-up)
    Registry->>Registry: enqueue message, status = running, reacquire slot
    Registry-->>Agent: follow-up prompt
    Agent->>Registry: next response or completion
```

The important distinction is that multi-turn follow-up is explicit. The main agent sends another prompt/message to the idle agent; the agents still do not share a live call stack or streaming internal thoughts.

### Method-level TaskRegistry call paths

The source-level registry methods are worth documenting separately because they explain why background agents, sync agents that become promotable, multi-turn agents, and MCP task records all appear in the same task UI.

| Method/path | Internal state touched | Observable behavior |
|---|---|---|
| `startAgent(...) -> _startAgentInner(...)` | Allocates an agent record, stores `pendingPromises`, creates an `AbortController`, marks `status: "running"`, starts the executor under `subAgentLimiter`, and calls the agent-start callback. | A background or multi-turn task becomes visible immediately, usually before the child agent has produced its first response. |
| `register(...)` | Inserts externally-created task records, including shell tasks and MCP task shims, then notifies registry listeners. | The tasks view can show shell/MCP work using the same list/update mechanism as subagents. |
| `complete(...)` / `fail(...)` | Moves the task to a terminal state, records result/error/completion time, resolves completion waiters, clears pending work, and notifies change/completion callbacks. | `read_agent` can return the final result; `session.idle` can be emitted once foreground and background work are drained. |
| `cancel(...)` / `cancelRecursive(...)` | Aborts the task controller, marks the task cancelled, propagates to child tasks, and wakes waiters. | Cancelling a parent agent also cancels descendant delegated work instead of leaving orphaned children. |
| `setLatestResponse(...)` | Appends a `turnHistory` entry and wakes result waiters. | `read_agent({ since_turn })` can return incremental responses without requiring the agent to finish. |
| `getAgentResult(...)` | Races current status, new-turn waiters, completion waiters, promotion waiters, and timeout. | A caller can either poll immediately or block until a new response/final state/background promotion happens. |
| `waitForMessage(...)` | Marks a multi-turn agent `idle`, releases the concurrency slot, registers a resolver, and waits for `sendMessage(...)`. | Idle agents stop consuming subagent concurrency while waiting for the main agent to send another instruction. |
| `sendMessage(...)` | Queues a follow-up message, marks the task `running`, reacquires concurrency, and wakes the waiting agent. | `write_agent`-style follow-up resumes the same multi-turn agent rather than launching a new subagent. |
| `promoteAgentToBackground(...)` | Resolves promotion waiters and flips execution state for a sync-style in-flight task. | Long-running sync work can be detached so the main agent can continue and later read the result. |
| `updateMcpTask(...)` / `setSteerCallback(...)` | Stores MCP task progress/status and optional steering callback. | MCP long-running tools can look like background agents and may be steerable when the server supports it. |

```mermaid
sequenceDiagram
    participant Tool as task/read/write tool
    participant Registry as TaskRegistry / B3
    participant Limiter as subAgentLimiter
    participant Exec as Agent executor

    Tool->>Registry: startAgent(agent spec)
    Registry->>Registry: create task record + pending promise
    Registry->>Limiter: acquire slot
    Registry->>Exec: run executor closure
    Exec->>Registry: setLatestResponse(turn 0)
    Registry-->>Tool: getAgentResult wakes on new turn
    alt multi-turn wait
        Exec->>Registry: waitForMessage(agent_id)
        Registry->>Limiter: release slot
        Tool->>Registry: sendMessage(agent_id, follow-up)
        Registry->>Limiter: reacquire slot
        Registry-->>Exec: follow-up prompt
    else final state
        Exec->>Registry: complete / fail
        Registry-->>Tool: completion waiter resolves
    end
```

### Custom-agent communication path

Custom agents enter through the catalog and then use the same delegation contract as built-ins. Their differences are in setup, not in the high-level communication protocol:

1. local, plugin, or remote definitions are loaded and normalized;
2. agent metadata contributes name, description, instructions, tools, MCP servers, skills, and optional model preference;
3. the `task` schema exposes eligible custom-agent names as valid `agent_type` values;
4. the custom-agent executor builds the prompt context, loads its tools/skills, runs lifecycle hooks, executes one or more turns, and returns a result;
5. sync, background, multi-turn, telemetry, cancellation, and concurrency behavior reuse the normal task/registry pathways.

```mermaid
flowchart LR
    Files["Local / plugin / remote\ncustom agent definitions"] --> Normalize["Normalize metadata"]
    Normalize --> Tools["Attach tools, MCP servers, skills"]
    Tools --> Catalog["Agent catalog"]
    Catalog --> TaskType["Valid agent_type"]
    TaskType --> Executor["Custom agent executor"]
    Executor --> Shared["Same task result / registry / hook channels"]
```

So the answer to “how do custom agents collaborate with normal agents?” is: the main agent selects them exactly like any other subagent, by name. They specialize the worker implementation, but they do not bypass the main agent’s orchestration or the registry’s state model.

## Agent catalog and selection

For per-agent prompt sources, packaged YAML details, and the `general-purpose` runtime-defined exception, see [`built-in-agents.md`](built-in-agents.md).

The built-in agent list is defined by the `BUILT_IN_AGENTS` catalog and includes:

| Agent | Purpose in the bundled description |
|---|---|
| `explore` | Fast codebase exploration/research, especially parallel independent search threads. |
| `task` | Execute commands/tests/builds/lints with summarized output. |
| `general-purpose` | Broad autonomous CLI agent. |
| `rubber-duck` | Independent critique of plans/implementations. |
| `code-review` | High signal-to-noise review of changes. |
| `research` | Deep research with searches and citations. |
| `rem-agent` | Memory/subconscious consolidation using the context board. |

Custom agents are loaded from several sources:

- local user/project agent Markdown files;
- plugin-provided agent files;
- remote GitHub custom-agent API responses;
- agent frontmatter fields such as `name`, `description`, `tools`, `mcp-servers`, `model`, `skills`, `github`, and `user-invocable`.

```mermaid
flowchart LR
    Settings["Settings + workspace"] --> Local["Local agent files"]
    Settings --> Plugin["Plugin agent dirs"]
    Auth["Auth + repo remote"] --> Remote["Remote custom-agent API"]

    Local --> Normalize["Normalize agent definition"]
    Plugin --> Normalize
    Remote --> Normalize

    Normalize --> Mcp["Attach agent MCP servers\nload/convert MCP config"]
    Mcp --> Catalog["Available custom agents"]
    Catalog --> TaskTypes["Valid task agent_type values"]
```

The `task` tool’s valid agent types are the active built-ins plus custom agents whose names normalize into the custom-agent map. If both a built-in and custom agent could handle a task, the prompt instructions tell the model to prefer the custom agent because it may contain environment-specific knowledge.

## The task tool lifecycle

The tool named `task` is constructed by `createTaskTool(...)`. Its input schema requires:

- `description` — short UI intent;
- `prompt` — full task instructions for the subagent;
- `agent_type` — built-in or custom agent name;
- `name` — short human-readable agent ID seed;
- optional `model` override;
- optional `mode`, either `sync` or `background`.

```mermaid
sequenceDiagram
    participant M as Main agent
    participant T as createTaskTool
    participant C as Agent catalog
    participant E as Agent executor
    participant R as TaskRegistry

    M->>T: call task({agent_type, prompt, mode, model})
    T->>T: validate taskToolInputSchema
    T->>C: check built-in/custom agent exists
    T->>T: validate model override and depth limit
    alt mode = sync
        T->>E: executeAgent(...)
        E-->>T: final result
        T-->>M: result text + telemetry
    else mode = background
        T->>R: startAgent(..., executionMode="background")
        R-->>T: agent_id
        T-->>M: "Agent started in background"
    end
```

Important behavior in the dispatch callback:

- Unknown `agent_type` fails with a valid-types list.
- Optional `model` is validated against `availableModels`.
- A cost/multiplier guard may downgrade a subagent model to the session model if the requested model is considered too expensive relative to the session model.
- `explore` may get an implicit low-effort `gpt-5.4-mini` override when the relevant experiment flag is enabled.
- `rubber-duck` may use a complementary model family when enabled.
- Subagent recursion is capped by `COPILOT_SUBAGENT_MAX_DEPTH`, defaulting to `6`.
- Concurrent subagents are capped by `COPILOT_SUBAGENT_MAX_CONCURRENT`, with plan-dependent defaults and an env cap up to `256`.

At the method level, the `createTaskTool(...)` callback (`I6n`) has four important branch points:

| Branch | Source-level behavior | Why it matters |
|---|---|---|
| Agent lookup | Merges built-ins and active custom agents, then rejects unknown names with a valid-type list. | The model cannot call arbitrary agent names; the valid enum is rebuilt from runtime state. |
| Model override | Validates `model` against available models, applies cost guard logic, and may synthesize model choices for `explore` or `rubber-duck`. | Subagent model choice is policy-controlled rather than a raw model string passthrough. |
| Depth/concurrency | Checks `subAgentDepth` against `COPILOT_SUBAGENT_MAX_DEPTH` and schedules execution through the subagent limiter. | Recursive delegation is possible but bounded. |
| Execution mode | `background` calls `launchBackgroundAgent(...)`; sync may execute directly, or create a registry-backed multi-turn task when multi-turn support is active. | A sync `task` call is not always just `await executor(...)`; it can still produce registry state for turn history, promotion, and idle messaging. |

```mermaid
flowchart TD
    Input["task tool input"] --> Parse["validate v6n schema"]
    Parse --> Agent{"known built-in/custom agent?"}
    Agent -->|no| AgentError["return valid agent_type list"]
    Agent -->|yes| Model{"model override?"}
    Model -->|invalid| ModelError["return valid model list"]
    Model -->|valid/none| Guard["cost guard + explore/rubber-duck model defaults"]
    Guard --> Depth{"subAgentDepth within cap?"}
    Depth -->|no| DepthError["reject recursion"]
    Depth -->|yes| Mode{"mode"}
    Mode -->|background| Background["launchBackgroundAgent / Bur -> TaskRegistry.startAgent"]
    Mode -->|sync + multi-turn| SyncRegistry["pre-create agent id -> startAgent -> getAgentResult"]
    Mode -->|plain sync| Direct["execute agent closure through limiter"]
```

## Sync vs background execution

```mermaid
flowchart TD
    Call["task call"] --> Mode{"mode?"}

    Mode -->|"sync / omitted"| Sync["Run subagent and wait"]
    Sync --> Return["Return result into same model turn"]

    Mode -->|"background"| Allowed{"Top-level agent?"}
    Allowed -->|"No, already subagent"| Sync
    Allowed -->|"Yes"| Start["launchBackgroundAgent(...) generates ID and start closure"]
    Start --> Register["TaskRegistry.startAgent"]
    Register --> Immediate["Immediate success with agent_id"]
    Immediate --> Continue["Main agent should continue independent work\nor wait for completion notification"]

    Register --> Running["Agent running asynchronously"]
    Running --> Completed["completed / failed / cancelled / idle"]
    Completed --> Notify["session notification / background task changed"]
```

Background mode is intentionally framed as a parallelism tool. The prompt instructions warn the model not to start a background task and immediately poll with `read_agent`; if it needs the result before doing anything else, it should use sync mode instead.

## TaskRegistry state model

`TaskRegistry` is the internal registry for asynchronous work. It stores `type: "agent"` records for subagents and MCP tasks, and shell work can appear elsewhere in session task listings.

Key stored fields include:

- `id`, `type`, `ownerId`, optional `parentId`;
- `agentType`, `description`, `prompt`, `modelOverride`, `executionMode`;
- `status`: `running`, `idle`, `completed`, `failed`, or `cancelled`;
- `messageQueue` for multi-turn follow-up messages;
- `turnHistory` and `latestResponse`;
- progress counters, latest intent, MCP task progress, and executor telemetry;
- `abortController` for cancellation.

```mermaid
stateDiagram-v2
    [*] --> running: startAgent
    running --> completed: executor resolves
    running --> failed: executor rejects
    running --> cancelled: cancelRecursive / abort
    running --> idle: multi-turn agent waits for message
    idle --> running: write_agent / sendMessage
    idle --> cancelled: cancelRecursive / abort
    idle --> completed: no more messages / executor exits
    completed --> [*]
    failed --> [*]
    cancelled --> [*]
```

The registry also supports:

- `getAgentResult(...)` — wait for a turn, final completion, promotion, or timeout;
- `sendMessage(...)` — append a follow-up message, waking an idle multi-turn agent;
- `waitForMessage(...)` — called by a multi-turn agent to enter `idle` and await a message;
- `setLatestResponse(...)` — records each agent turn and wakes result waiters;
- `promoteAgentToBackground(...)` — lets a running sync-style agent be moved to background;
- `waitForAgents(...)` — used during prompt-mode shutdown to wait for background work.

```mermaid
sequenceDiagram
    participant A as Background agent
    participant R as TaskRegistry
    participant M as Main agent

    A->>R: setLatestResponse(agent_id, response)
    R->>R: append turnHistory entry
    R-->>M: result waiter wakes
    alt multi-turn enabled
        A->>R: waitForMessage(agent_id)
        R->>R: status = idle, release concurrency slot
        M->>R: sendMessage(agent_id, follow-up)
        R->>R: status = running, reacquire slot
        R-->>A: follow-up prompt
    else no follow-up
        A->>R: complete(agent_id)
    end
```

## Subagent execution

Built-in agents are executed through `SessionAgentExecutor`. Custom agents have a similar `CustomAgentExecutor` wrapper. Both follow roughly the same pattern:

1. emit a `subagent_session_boundary` start event;
2. initialize or reuse an agent session/toolset;
3. run `subagentStart` hook and prepend any returned `additionalContext`;
4. load skills referenced by the agent definition;
5. run one or more turns;
6. run `subagentStop` hook; if it blocks with a reason, feed that reason back as a new prompt and continue;
7. if multi-turn is enabled, wait for follow-up messages via the registry;
8. emit end/failure boundary and return the final response.

```mermaid
flowchart TD
    Start["Subagent executor starts"] --> BoundaryStart["Emit subagent start boundary"]
    BoundaryStart --> HookStart["Run subagentStart hooks"]
    HookStart --> AddCtx["Merge additionalContext + skills + prompt"]
    AddCtx --> Turn["Run model turn with subagent tools"]
    Turn --> HookStop["Run subagentStop hooks"]
    HookStop --> Decision{"Hook decision?"}
    Decision -->|"block + reason"| AddCtx
    Decision -->|"allow / none"| Multi{"multi-turn?"}
    Multi -->|"yes"| WaitMsg["waitForMessage -> idle"]
    WaitMsg --> More{"follow-up?"}
    More -->|"yes"| AddCtx
    More -->|"no"| End["Emit end boundary + return"]
    Multi -->|"no"| End
```

`assembleSubagentTools(...)` is the recursive tool-assembly point for subagents. It increments `subAgentDepth`, disables background notifications inside subagents, assembles tools by recursively calling `assembleRuntimeTools(...)`, and injects the `task` tool plus helpers such as agent read/write tools when enabled. It chooses between session-based subagents and executor-based subagents behind the `SESSION_BASED_SUBAGENTS` feature flag.

### SessionAgentExecutor method flow

The session-based executor (`dZ`) is the built-in-agent path behind `SESSION_BASED_SUBAGENTS`. It creates a child session rather than running a loose callback. That makes hooks, skills, tool initialization, selected model, events, and teardown look like a normal session lifecycle.

| Method | Main responsibilities |
|---|---|
| `execute(...)` | Checks required `createSubagentSession` and `toolCallId`, emits start boundary, initializes the child session, runs turns, handles hook-forced continuations, handles multi-turn waits, emits end/failure boundary, and tears down. |
| `initializeSession(...)` | Creates or reuses the child subagent session, sets the chosen model, loads skills, initializes/validates the child toolset, applies subagent instructions/system-message replacement, and runs `subagentStart` hooks. |
| `runTurn(...)` | Sends the prompt into the child session, then scans emitted events for the latest `assistant.message` and `tool.execution_complete` count so registry progress can reflect tool activity. |
| `teardown(...)` | Stops or releases the child session resources after normal completion, hook-blocked loops, failures, or cancellation. |

```mermaid
sequenceDiagram
    participant Registry as TaskRegistry
    participant Exec as SessionAgentExecutor / dZ
    participant Child as Child session
    participant Hooks as Hook runner

    Registry->>Exec: execute(prompt, agent, modelOverride)
    Exec->>Child: createSubagentSession
    Exec->>Child: setSelectedModel + initializeAndValidateTools
    Exec->>Hooks: subagentStart
    Hooks-->>Exec: optional additionalContext
    loop until allowed stop or multi-turn exit
        Exec->>Child: runTurn(prompt/additionalContext)
        Child-->>Exec: assistant.message + tool events
        Exec->>Hooks: subagentStop(stopReason)
        alt hook blocks
            Hooks-->>Exec: decision=block + reason
            Exec->>Child: run another turn with reason
        else multi-turn enabled
            Exec->>Registry: setLatestResponse + waitForMessage
            Registry-->>Exec: optional follow-up message
        end
    end
    Exec->>Child: teardown
    Exec-->>Registry: final response/result
```

## Hooks around agent orchestration

Hooks are configured through JSON/settings and mapped by `mapHookConfig(...)`. The relevant agent lifecycle hooks are:

| Hook | Payload highlights | Output effect |
|---|---|---|
| `subagentStart` | `sessionId`, `cwd`, `transcriptPath`, `agentName`, `agentDisplayName`, `agentDescription` | May return `additionalContext`, which is prepended to the subagent prompt. Supports `matcher` on agent name. |
| `subagentStop` | `sessionId`, `cwd`, `transcriptPath`, `agentName`, `agentDisplayName`, `stopReason` | May return `decision`/`reason`; a blocking decision can cause another subagent turn with the reason as input. |
| `agentStop` | `sessionId`, `cwd`, `transcriptPath`, `stopReason` | May block the main agent stop; the reason is enqueued as another user message. |

```mermaid
sequenceDiagram
    participant S as Session
    participant H as Hook runner NI
    participant A as Agent/subagent

    S->>H: subagentStart(payload)
    H-->>S: optional additionalContext
    S->>A: run prompt + additionalContext
    A-->>S: response
    S->>H: subagentStop(payload)
    alt hook blocks
        H-->>S: decision=block, reason
        S->>A: run another turn with reason
    else hook allows
        H-->>S: no blocking decision
        S-->>S: finish subagent
    end
```

## Slash commands that orchestrate agents

Several slash commands do not execute complex work directly. They return an `agent-prompt` that nudges the main agent into using `task`.

```mermaid
flowchart TD
    Slash["Slash command"] --> Kind{"Command"}
    Kind --> Review["/review"]
    Kind --> Research["/research <topic>"]
    Kind --> Subconscious["/subconscious run"]
    Kind --> Fleet["/fleet [prompt]"]
    Kind --> Autopilot["/autopilot [on/off]"]

    Review --> ReviewPrompt["agent-prompt: use task agent_type=code-review"]
    Research --> ResearchPrompt["agent-prompt: use research subagent and save report"]
    Subconscious --> RemPrompt["agent-prompt: task agent_type=rem-agent mode=background"]
    Fleet --> FleetStart["session.fleet.start(...)"]
    Autopilot --> ModeSet["session.mode.set(autopilot/interactive)"]

    ReviewPrompt --> MainAgent["Main agent"]
    ResearchPrompt --> MainAgent
    RemPrompt --> MainAgent
    MainAgent --> TaskTool["task tool"]
```

Observed examples:

- `/review` injects: use `task` with `agent_type: "code-review"`.
- `/research <topic>` injects a research prompt and a target report path under the session/temp area.
- `/subconscious run` injects a very specific instruction: call `task` exactly once with `agent_type: "rem-agent"`, `mode: "background"`, `name: "rem-consolidate"`, and `description: "Consolidate session learnings"`.
- `/fleet` calls `session.fleet.start({ prompt })` directly.
- `/autopilot` toggles session mode between `interactive` and `autopilot`.

For the detailed `/fleet` implementation path, including `session.fleet.start`, `autopilot_fleet`, SQL `todos`/`todo_deps`, and `TaskRegistry` coordination, see [`fleet-mode.md`](fleet-mode.md).

## Research orchestrator workflow

The `/research` flow has a large embedded orchestrator prompt built by `buildResearchOrchestratorPrompt(...)`. The top-level agent is explicitly told not to research directly. Instead, it acts as a project manager and dispatches many `research` subagents through `task` in sync mode.

```mermaid
flowchart TD
    UserTopic["/research topic"] --> Prompt["Research orchestrator prompt"]
    Prompt --> Plan["Classify query + plan search threads"]
    Plan --> Dispatch["Dispatch 3-5 parallel task calls"]
    Dispatch --> R1["research subagent A"]
    Dispatch --> R2["research subagent B"]
    Dispatch --> R3["research subagent C"]
    R1 --> Evaluate["Evaluate returned findings"]
    R2 --> Evaluate
    R3 --> Evaluate
    Evaluate --> Gate{"Enough coverage?"}
    Gate -->|"No"| Dispatch
    Gate -->|"Yes"| Report["Synthesize final report"]
    Report --> Save["create report markdown"]
```

Notable constraints in the prompt:

- allowed tools are limited to `task`, `create`, `view` for subagent temp outputs, and `report_intent`;
- direct `grep`, `glob`, `web_fetch`, `web_search`, GitHub MCP tools, `read_agent`, and `ask_user` are forbidden;
- `task` must use `agent_type: "research"` and `mode: "sync"`;
- it encourages at least `6-10` total subagent dispatches for thoroughness.

## MCP task support

MCP tools can declare task support through metadata like `execution.taskSupport`. The bundle caches whether tools are known task tools and whether task support is required. If a tool requires task support, the normal MCP call path is replaced by a task-stream bridge.

```mermaid
sequenceDiagram
    participant M as Main agent
    participant Host as MCP host
    participant MCP as MCP server
    participant R as TaskRegistry

    M->>Host: call MCP tool
    Host->>Host: detects taskSupport = required
    Host->>MCP: experimental.tasks.callToolStream(...)
    MCP-->>Host: taskCreated(taskId)
    Host->>R: startAgent("mcp-task", executionMode="background")
    Host-->>M: "MCP task started in background with agent_id"
    MCP-->>Host: taskStatus / progress / result
    Host->>R: updateMcpTask(progress/status)
    alt stream result
        Host->>R: completed/failed + result
    else stream error/no result
        Host->>MCP: poll task until terminal
        Host->>R: final task state
    end
```

Important differences from normal subagents:

- MCP tasks are represented in the same registry as `agentType: "mcp-task"`.
- Their prompt is the JSON-serialized MCP tool arguments.
- Cancellation propagates back to the MCP task.
- If steering support is enabled, `write_agent`-style follow-up can map to MCP `tasks/steer`; otherwise MCP task agents reject follow-up messages and advise starting a new task.
- Progress is stored under `progress.mcpTask`, including status, message, progress totals, event-stream warnings, and timestamps.

## How the agent decides a task is complete

There are three different “done” concepts in the runtime, and only one means the **user's overall task** is complete.

| Signal | What it means | What it does **not** mean |
|---|---|---|
| `session.task_complete` | The main model explicitly called the `task_complete` terminal tool, and the tool execution produced a completion event. | It is not a semantic proof that the request was solved; the runtime trusts the model/tool protocol and the tool's validation result. |
| `session.idle` | The current processing loop is drained and there are no running background agents blocking idleness. | The user task may still be unfinished. In autopilot, idle is the trigger to either continue or stop. |
| `TaskRegistry` status `completed` / `failed` / `cancelled` / `idle` | A background or multi-turn subagent changed lifecycle state. | This does not mark the main user's task complete; it only tells the main agent that delegated work changed state or produced results. |

So the short answer is: **for autonomous/autopilot completion, the agent decides by calling `task_complete`; the runtime does not infer completion from a final assistant message or from `session.idle`.** The runtime then records and reacts to that explicit tool call.

### Main-agent completion protocol

`task_complete` is exposed only when `autopilotActive` is true. The tool is built by `$Vn()` with:

- tool name `UM = "task_complete"`;
- input schema `Dgr`, currently just `{ summary: string }`;
- `isTerminal: true`, so the tool is intended to end the turn/task;
- instructions that say to call it only after all requested work is done and verified, and not after unresolved errors, remaining steps, or uncertainty.

When the tool finishes, the normal tool pipeline first emits `tool.execution_complete`. The session loop then checks `ue === UM` and emits:

```text
session.task_complete({ summary, success })
```

`success` is derived from the tool result type. Consumers treat `success !== false` as the completion signal, which means failed validation/tool execution does not count as completion.

```mermaid
sequenceDiagram
    participant Model as Main model
    participant Tool as task_complete tool
    participant Session as Session runtime
    participant AutoListener as Autopilot listener
    participant UI as Timeline/UI

    Model->>Tool: task_complete({ summary })
    Tool-->>Session: success result + summary
    Session->>Session: emit tool.execution_complete
    Session->>Session: emit session.task_complete({ summary, success })
    Session-->>AutoListener: completion event
    AutoListener->>AutoListener: mark taskCompleted when success !== false
    Session-->>UI: render Task complete entry
```

The UI projection hides the raw `task_complete` tool call in the timeline and renders the `session.task_complete` event as a `Task complete` entry with the model-provided summary.

### Idle versus complete

`session.idle` is emitted by `emitSessionIdle(...)` after processing drains. It is intentionally separate from task completion. Background agents can defer idleness: `hasActiveBackgroundWork()` checks for running agent tasks, and `emitDeferredSessionIdleIfReady()` waits until the foreground loop, queued messages, and running background agents allow idleness.

Autopilot uses this idle event as a checkpoint:

```mermaid
flowchart TD
    Turn["model/tool turn ends"] --> Idle["session.idle"]
    Idle --> Done{"session.task_complete seen?"}
    Done -->|"yes"| Stop["stop autonomous continuation"]
    Done -->|"no"| Error{"non-model error or abort?"}
    Error -->|"yes"| Stop
    Error -->|"no"| Limit{"continuation limit reached?"}
    Limit -->|"yes"| Stop
    Limit -->|"no"| Continue["send hidden UTe reminder"]
    Continue --> Turn
```

The hidden reminder `UTe` says the task has not yet been marked complete with `task_complete`, tells the model to stop planning and keep working, and explicitly warns not to call `task_complete` while there are open questions, unresolved errors, or remaining steps.

### TUI versus prompt mode

The same event is used in both interactive autopilot and non-interactive prompt mode, but the surrounding loop differs slightly:

| Runtime path | Completion behavior |
|---|---|
| Interactive/TUI autopilot | `F5o(...)` listens for `session.task_complete`, `session.error`, `abort`, and `session.idle`. If idle arrives before completion and the limit is not reached, it sends `UTe` with `displayPrompt: ""` and `requiredTool: "task_complete"`. |
| Prompt-mode autopilot | `runPromptMode(...)` sets `currentMode = "autopilot"`, sends the initial prompt, then sends `UTe` after idle until `session.task_complete`, error, abort, or the limit. |
| Prompt mode without autopilot | Sends the prompt once, then waits for pending background work; it does not require `task_complete` as the overall done signal. |
| Normal interactive mode | The user-facing turn can simply stop at an assistant response; `task_complete` is not part of the normal tool surface unless autopilot is active. |

The detailed flag comparison is in [`autopilot-and-no-ask-user.md`](autopilot-and-no-ask-user.md).

### Stop hooks can veto stopping

The runtime also has a policy hook after normal model turns. After an `end_turn`, if the session was not aborted, the session calls configured `agentStop` hooks with `stopReason: "end_turn"`. If a hook returns `decision: "block"` plus a `reason`, the runtime prepends that reason as another user message and resumes processing.

This is not the primary task-completion detector. It is a guardrail that can say “you tried to stop, but continue because …”. In other words, completion is still model-declared through `task_complete`; hooks can prevent a stop from being accepted.

### Background agents are separate

Background subagents and MCP tasks finish through `TaskRegistry.complete(...)`, `fail(...)`, or `cancelRecursive(...)`. Those transitions trigger background-task change events and, for background agents, `agent_completed` / `agent_idle` system notifications. The main model can read those results and decide what to do next.

They do **not** automatically call `task_complete` for the main task. A completed background agent means delegated work finished; the main agent still has to synthesize results, perform remaining validation, and call `task_complete` if the overall user request is done.

## Subconscious / rem-agent

There are two observed paths into the memory-consolidation agent:

```mermaid
flowchart TD
    Manual["/subconscious run"] --> Prompt["agent-prompt"]
    Prompt --> Task["task(agent_type=rem-agent, mode=background)"]
    Task --> Registry["TaskRegistry background agent"]
    Registry --> Board["context board add/prune"]

    Shutdown["Interactive shutdown"] --> Gate{"COPILOT_SUBCONSCIOUS\n+ enough user turns?"}
    Gate -->|"yes"| Spawn["detached copilot --agent rem-agent -p ..."]
    Spawn --> Board
    Gate -->|"no"| End["normal shutdown"]
```

The manual path uses the normal `task` tool. The shutdown path launches a detached process with `--agent rem-agent`, `-p` set to the context-board update prompt, `--yolo`, `--silent`, and environment values tying the detached session to the parent session/engagement.

For the full memory architecture, including the cloud memory API, local JSONL strategy, memory permissions, dynamic context board persistence, `context_board` commands, sidekick launch conditions, and inbox flow, see [`memory-and-context-board.md`](../02-context-model-loop/memory-and-context-board.md).

## Key takeaways

- `task` is not just another helper; it is the public model-facing orchestration surface for subagents.
- `TaskRegistry` is the core in-process task registry for background/multi-turn work.
- Main-agent task completion is explicit and model-declared through `task_complete`; `session.idle` and background-agent completion are not equivalent to overall task completion.
- Built-in and custom agents share the same high-level lifecycle: prompt assembly, optional hooks, one or more turns, telemetry/progress, and result capture.
- Background mode is designed for real parallel work, not polling.
- Multi-turn agents use `turnHistory`, `messageQueue`, `waitForMessage`, and `sendMessage` to keep an agent alive after a response.
- Hooks can inject context at subagent start and can force additional turns at subagent/main-agent stop.
- MCP task support maps external long-running MCP tools into the same background-agent UI/state model.
- Slash commands often act as orchestration macros: they generate prompts or mode changes that lead the main agent toward the `task` tool.
