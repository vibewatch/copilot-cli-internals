# Conversation compaction and memory compression in Copilot CLI

This document explains the implementation behind the Copilot CLI behavior that is easy to describe as "memory compression". In the analyzed bundle, the main local mechanism is **conversation compaction**: old chat history is summarized by a model call, then the session replaces many prior messages with a compact summary so the next request fits within the model context window.

This is different from binary compression and also different from long-term memory consolidation. The CLI uses three adjacent concepts:

| Concept | Primary purpose | Main output | Scope |
|---|---|---|---|
| Conversation compaction | Reduce current context-window usage. | Summary-backed replacement messages and optional checkpoints. | Current session. |
| Memory consolidation | Extract reusable learnings for future sessions. | Dynamic context board entries via `context_board add/prune`. | Repository and branch board. |
| Provider-side compaction | Let a provider or remote agent report context compaction events. | Provider stream events or SDK-level edits. | Provider request internals. |

## Source anchors

`app.js` is bundled/minified. This table uses semantic aliases first and keeps generated names only as lookup anchors for the analyzed `@github/copilot` bundle; they may shift across releases.

| Area | Semantic alias | Minified anchor | Approx. location | What it does |
|---|---|---:|---:|---|
| Slash command definition | `/compact` command | `kps(...)`, command registry | `app.js` 1300, 1340 | Calls `history.compact()` and returns messages/tokens removed. |
| Session history facade | `SessionHistory.compact()` | `oKn(...)` | `app.js` 4396 | Exposes `compact()` as a wrapper over `session.compactHistory()`. |
| Manual compaction | `Session.compactHistory()` | method name preserved | `app.js` 4481 | Runs the explicit `/compact` path, emits events, calls the model, applies the summary, and persists checkpoints. |
| Compaction hooks | `preCompact` hook | `PreCompact`, `preCompact`, `NI(...)` | `app.js` 238, 2797, 4481, 4487 | Allows configured hooks to run before manual or automatic compaction. |
| Compaction prompts | `buildCompactionPrompt(...)` | `n4n`, `i4n`, `V5e` | `app.js` 2797-3034 | Defines the detailed summary instructions and `conversation-compaction` interaction type. |
| Message preparation | `prepareCompactionMessages(...)` | `j5e(...)` | `app.js` 3063 | Filters/augments messages and appends the summary request. |
| Replacement builder | `buildCompactedHistory(...)` | `yCe(...)` | `app.js` 3063 | Builds the summary-backed replacement message list using summary, user turns, plan/todo, invoked skills, and agent summary. |
| Tool-boundary adjustment | `adjustCompactionBoundary(...)` | `ift(...)`, `g4n(...)` | `app.js` 3090-3092 | Avoids orphaned tool-result messages when splitting compacted and new history. |
| Model call | `runCompactionModelCall(...)` | `sft(...)` | `app.js` 3090 | Calls the selected model with compaction-specific headers and returns summary plus token usage. |
| Automatic processor | `CompactionProcessor` | `ECe` | `app.js` 3092 | Starts background compaction around context thresholds and applies it before requests that need space. |
| Context-limit detection | `isContextLimitError(...)` | `ise(...)` | `app.js` 1026 | Detects provider context-limit errors and forces compaction on retry. |
| Checkpoint persistence | `persistCompactionCheckpoint(...)` | method name preserved | `app.js` 4479 | Writes the summary as a workspace checkpoint when workspace state is enabled. |
| Workspace checkpoints | `WorkspaceManager.addSummary(...)` | `qq.addSummary(...)` | `app.js` 3559 | Writes checkpoint Markdown files and updates the checkpoint index. |
| Event replay | `applyCompactionToMessages(...)` | method name preserved | `app.js` 4475 | Reapplies compaction when rebuilding session state from events. |
| Event schemas | `session.compaction_start`, `session.compaction_complete` | schema rows | `app.js` 4361 | Defines fields for summary content, token counts, checkpoint number/path, and model usage. |
| Telemetry mapping | Compaction telemetry | `z6n(...)`, `j6n(...)` | `app.js` 4033 | Emits `session_compaction_start` and `session_compaction_complete` telemetry. |
| Timeline rendering | Conversation compacted entry | `onCompaction(...)` | `app.js` 1739, 1817, 1952, 6860 | Shows compacted-history events in timeline/export renderers. |
| TUI status | Compacting indicator | `kOo(...)` and event handlers | `app.js` 6405, 7335 | Shows "Compacting conversation history" while a compaction is in progress. |
| Model switch trigger | Pre-switch compaction | `gte(...)` | `app.js` 7340 | Compacts before switching to a model whose context limit is too small for current history. |
| Memory pressure trigger | Emergency compaction | `respondToMemoryPressure()` | `app.js` 4481 | After garbage collection, can trigger manual-style compaction if session history is large enough. |
| Remote session gap | Remote compaction unsupported | `RemoteSession.compactHistory()` | `app.js` 4489 | Remote sessions throw because local compaction is not implemented for that class. |

## Manual `/compact` workflow

The manual path starts from the slash command and ends by mutating the session's in-memory chat messages.

```mermaid
sequenceDiagram
    autonumber
    participant User as User
    participant Slash as Slash command registry
    participant History as session.history
    participant Session as Session.compactHistory
    participant Hooks as preCompact hooks
    participant Model as compaction model call
    participant Workspace as checkpoint store
    participant Events as session events

    User->>Slash: /compact
    Slash->>History: compact()
    History->>Session: compactHistory()
    Session->>Events: session.compaction_start
    Session->>Hooks: trigger preCompact with trigger="manual"
    Session->>Session: read current chat messages
    Session->>Model: summarize old conversation history
    Model-->>Session: summary + token usage
    Session->>Session: build replacement messages from summary
    Session->>Workspace: optionally persist summary checkpoint
    Session->>Events: session.compaction_complete
    Session-->>History: tokens/messages removed
    History-->>Slash: compact result
```

Important guardrails in `compactHistory()`:

- it rejects a second manual compaction while one is already running;
- it requires at least two chat messages;
- it requires authentication or a configured provider;
- it requires an active system/agent context, so compaction cannot run before the session has built a model prompt;
- it uses an `AbortController`, allowing the TUI to cancel manual compaction.

The compaction model input is not just the raw transcript. The manual path builds a special prompt that asks for a detailed summary, passes the active system context separately, and excludes system messages from the summarized message list. The result is then merged back into a replacement history through `buildCompactedHistory(...)`.

## Automatic background compaction

`CompactionProcessor` is registered as a request processor for model calls. It watches token utilization and starts background compaction before the context window is exhausted.

```mermaid
flowchart TD
    Request[Provider request being prepared] --> Count[Count message and tool-definition tokens]
    Count --> Utilization[Compute context utilization]
    Utilization --> Pending{Pending compaction exists?}

    Pending -->|completed| ApplyReady[Apply completed result]
    Pending -->|running and buffer exhausted| WaitApply[Wait for result and apply]
    Pending -->|running and enough buffer| Continue[Continue request]

    Pending -->|none| Threshold{At or above background threshold?}
    Threshold -->|no| Continue
    Threshold -->|yes| EnoughMessages{Enough messages?}
    EnoughMessages -->|no| Continue
    EnoughMessages -->|yes| Start[Start background compaction]
    Start --> Continue

    Count --> ErrorRetry{Prior context-limit error?}
    ErrorRetry -->|yes| Force[Force compaction on retry]
    Force --> WaitApply
```

The default thresholds are encoded in `CompactionProcessor`:

| Setting | Default | Override |
|---|---:|---|
| Background compaction threshold | `0.8` | `COPILOT_BACKGROUND_COMPACTION_THRESHOLD` |
| Buffer exhaustion threshold | `0.95` | `COPILOT_BUFFER_EXHAUSTION_THRESHOLD` |
| Minimum messages | `4` | Constructor option in the processor configuration |

The background path is intentionally opportunistic. At roughly 80 percent utilization, it starts a summary request in the background while the current turn can continue. At roughly 95 percent utilization, or after a provider context-limit failure, it waits for the summary and applies it before sending the next request.

## How the replacement history is built

The compacted history is not a single plain string appended to the transcript. The implementation builds a replacement message list that preserves the important scaffolding the agent needs after compaction.

```mermaid
flowchart LR
    Old[Old chat messages] --> Prompt[Compaction prompt]
    Prompt --> Summary[Model-generated summary]
    Summary --> Builder[Replacement builder]

    OriginalUsers[Original user messages] --> Builder
    Plan[Current plan] --> Builder
    Todo[Todo content] --> Builder
    Skills[Invoked skills] --> Builder
    AgentSummary[Active agent summary] --> Builder
    NewMessages[Messages after checkpoint] --> Merge[Final message list]
    Builder --> Merge
    Merge --> SessionState[Session chat messages]
```

The replacement builder uses several context sources when available:

- the model-generated compaction summary;
- original user-message content tracked by the session;
- current plan content from the workspace plan file;
- todo content captured by the session;
- invoked skill names and instructions;
- active custom-agent summary for agent handoff continuity;
- newly arrived messages after the checkpoint boundary.

This is a **lossy semantic compression**. It preserves what the summary prompt asks the model to preserve, not every byte of the prior transcript.

### Tool-call boundary safety

The helper that adjusts the compaction boundary prevents malformed chat history after replacement. If the split point would leave tool-result messages without their preceding assistant tool calls, the boundary is moved or leading orphaned tool messages are dropped. This matters because provider chat APIs generally require tool messages to appear only after matching assistant tool-call messages.

## Checkpoints and session replay

When workspace state is enabled, successful compaction persists the summary as a checkpoint.

```mermaid
sequenceDiagram
    autonumber
    participant Session as Session
    participant Persist as persistCompactionCheckpoint
    participant Workspace as WorkspaceManager
    participant Files as workspace files
    participant Replay as event replay

    Session->>Persist: summary content
    Persist->>Persist: parse optional checkpoint title
    Persist->>Workspace: addSummary(summary, title)
    Workspace->>Files: write checkpoints/NNN-title.md
    Workspace->>Files: update checkpoints/index.md
    Workspace->>Files: update workspace.yaml summary_count
    Session->>Session: emit session.compaction_complete
    Replay->>Replay: rebuild messages from events
    Replay->>Replay: applyCompactionToMessages using summaryContent
```

The `/session checkpoints` command reads this checkpoint index. Its empty-state text explicitly says checkpoints are created when context is compacted.

Session replay also understands compaction. When a saved `session.compaction_complete` event is processed, the session applies the same summary replacement to reconstructed `_chatMessages`, then resets the compaction checkpoint marker. Snapshot rewind and truncation paths account for compacted checkpoints so local workspace metadata stays aligned with the retained event history.

## Events, telemetry, and UI status

Compaction is visible as a first-class session event, not just an internal mutation.

| Event or output | Purpose |
|---|---|
| `session.compaction_start` | Records token breakdown when compaction starts. |
| `session.compaction_complete` | Records success/failure, token deltas, summary, checkpoint data, request id, and model usage. |
| `session.usage_info` | Updates current token and message counts after compaction. |
| `session_compaction_start` telemetry | Captures pre-compaction context breakdown. |
| `session_compaction_complete` telemetry | Captures tokens removed, messages removed, checkpoint number, model, duration, and request id. |
| Timeline entry `compaction` | Renders as Conversation Compacted in timeline/export output. |
| TUI status | Shows Compacting conversation history while manual or blocking compaction is active. |

The compaction interaction type is `conversation-compaction`, which lets telemetry and request headers distinguish summary calls from normal user turns.

## Other triggers

Manual `/compact` and automatic threshold compaction are the two main paths, but the same session-level `compactHistory()` can also be reached by adjacent flows.

| Trigger | Behavior |
|---|---|
| Model switch to a smaller context window | The TUI checks whether compaction is needed before applying the target model. If the user proceeds, it calls `compactHistory()` first. |
| Memory pressure | After requesting garbage collection, the session can trigger emergency compaction if enough messages and an active system context exist. |
| Provider context-limit error | `CompactionProcessor` marks the next retry for forced compaction after status `413` or recognized context-window error text. |

## Relationship to memory consolidation

Conversation compaction is separate from the memory systems documented in [`memory-and-context-board.md`](./memory-and-context-board.md).

```mermaid
flowchart TD
    LongSession[Long current session] --> Compact[Conversation compaction]
    Compact --> Current[Smaller current context]
    Compact --> Checkpoint[Optional checkpoint summary]

    FinishedSession[Session trajectory] --> Rem[rem-agent consolidation]
    Rem --> Board[Dynamic context board]
    Board --> Future[Future sessions via sidekick inbox]
```

| Question | Conversation compaction | Memory consolidation |
|---|---|---|
| What starts it? | `/compact`, automatic thresholds, model switch, memory pressure, or context-limit retry. | `/subconscious run` or eligible detached shutdown. |
| What does it mutate? | Current session chat messages. | Dynamic context board entries. |
| What does it optimize for? | Fitting the current request into the context window. | Reusing durable learnings in future sessions. |
| What tool is involved? | No model-visible tool is required; the session calls the model directly. | `rem-agent` uses the `context_board` tool. |
| Is it lossy? | Yes, old turns become a model-generated summary. | Yes, the agent chooses which facts are worth keeping. |

## Provider-side compaction signals

The bundle also contains provider and remote-agent compaction signals, including `agent.thread_context_compacted`, `compaction_delta`, and Anthropic SDK `compactionControl` support. Those are adjacent compatibility paths. They do not replace the CLI's local conversation-compaction pipeline, where the session itself builds the summary request and mutates local history.

## Failure and cancellation behavior

Observed failure handling is conservative:

- manual compaction throws if there is nothing to compact or no active model context;
- empty model output is treated as compaction failure;
- manual compaction can be aborted, producing an `AbortError`-style cancellation;
- background compaction failure emits a failed `session.compaction_complete` event but does not necessarily destroy the session;
- cancelled background compaction results are discarded;
- remote sessions currently throw `RemoteSession.compactHistory() is not implemented yet.`

## Takeaways

- The core implementation is semantic summary compaction, not binary compression.
- `/compact` is a thin slash-command wrapper over `session.compactHistory()`.
- Automatic compaction is request-pipeline logic in `CompactionProcessor`, using 80 percent and 95 percent context-utilization defaults.
- The summary replaces prior chat messages and can be persisted as a checkpoint.
- Hooks, events, telemetry, timeline rendering, and TUI status all treat compaction as a first-class session lifecycle event.
- Long-term memory consolidation is handled separately by `rem-agent` and the dynamic context board.