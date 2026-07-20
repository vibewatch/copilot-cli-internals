# Memory and dynamic context board in Copilot CLI

This document explains the memory-related systems in the extracted `@github/copilot` CLI bundle. The implementation is easiest to understand as four cooperating layers:

1. **Agentic memory API**: service-backed memories injected into the main system prompt and curated through `store_memory` / `vote_memory` tools.
2. **Local repository memory strategy**: an optional in-repository JSONL strategy that writes `.github/copilot-memories.jsonl`.
3. **Dynamic context board**: a local, repository/branch-scoped scratchpad updated by `rem-agent` through `context_board`.
4. **Sidekick inbox retrieval**: background sidekicks that read memory/context signals and publish useful findings into the main session inbox.

These layers are related, but they are not the same storage system. The memory API is remote/service-backed. The context board is local session-store-backed state with its own tool and consolidation workflow.

For current-session context-window reduction, see [`conversation-compaction.md`](conversation-compaction.md). Conversation compaction summarizes old transcript turns and replaces session messages; it does not write durable memories or dynamic context board entries.

## Source anchors

`app.js` is bundled/minified. This table uses semantic aliases first and keeps generated names only as lookup anchors for the analyzed `@github/copilot` bundle; they may shift across releases.

| Area | Semantic alias | Minified anchor | Approx. location | What it does |
|---|---|---:|---:|---|
| Memory feature resolver | Native memory flags and settings checks | `S.memoryFeatureFlags()`, `Q2e(...)`, `i$(...)` | `app.js` 252 | Resolves cloud/local/user-scoped memory availability. |
| Memory prompt loader | Service prompt/context retrieval | native memory request helpers, `Y8n(...)` | `app.js` 252 | Returns prompt text, counts, store instructions, and tool definitions. |
| Memory endpoint builder | Memory service request planning | native-owned service strategy | `app.js` 252-311 | Builds and executes repository/user memory requests through the service client. |
| Memory tool constants | `STORE_MEMORY_TOOL_NAME`, `VOTE_MEMORY_TOOL_NAME` | `T_="store_memory"`, `FZ="vote_memory"` | `app.js` 252 | Defines `store_memory` and `vote_memory`. |
| Memory tool provider | `MemoryToolProvider` | `LZ` | `app.js` 311 | Builds store/vote tool schemas and callbacks, validates inputs, filters secrets, and requests permission. |
| Service memory strategy | Service-backed strategy | `r$` usage in `_qn(...)` | `app.js` 608 | Stores and votes memories through the memory service and emits memory-tool telemetry. |
| Local JSONL memory strategy | `JsonFileMemoryStrategy` | `zFe` | `app.js` 604-606 | Stores local memories in `.github/copilot-memories.jsonl` and optimizes them at shutdown. |
| Memory tool loader | `loadMemoryTools(...)` | `_qn(...)` | `app.js` 608 | Creates service or local JSONL memory tools from the resolved memory mode and tool definitions. |
| Memory API cache loader | `gAt(...)`, `oAt(...)` | `memoryApiCache` | `app.js` 608, 2742 | Caches in-flight/results, invalidates on repository changes and TTL expiry, and reuses a matching result. |
| System prompt injection | `buildSystemPrompt(...)` call site | `aX(...)`, `memoriesContextPrompt` | `app.js` 2755-2759 | Passes enabled memory prompt text into the main system prompt. |
| Allowed-tool mapping | Memory permission kind | `store_memory`, `vote_memory`, native allowed-tool parser | `app.js` 252, 604-608 | Maps memory tools to the memory permission path. |
| Memory permission dispatcher | Central permission service | memory request branch | `app.js` 109, 2686-2710 | Applies allow/deny/session rules and asks the user for memory store/vote approval when needed. |
| Memory permission UI | `MemoryPermissionPrompt` | memory request renderer | `app.js` 3628 | Displays memory update approval prompts in the TUI. |
| Context board formatter | Dynamic context board table | `<dynamic_context_board>` | `app.js` 185 | Renders board metadata as a compact model-visible table and instructs agents to fetch full content. |
| Context board tool | `createContextBoardTool(...)` | native `toolContextBoardPrepareInput(...)` | `app.js` 186 | Exposes context-board operations through a native-backed descriptor. |
| Dynamic context store | Dynamic context native/session APIs | native store plus session methods | `app.js` 185-186, 2686 | Persists and queries board entries. |
| Board initialization | `initDynamicContextBoard(...)` | preserved method name | `app.js` 2768 | Configures repository/branch board state on session create and resume. |
| Built-in REM agent | Built-in catalog row | `ozn`, `rem-agent` | `app.js` 324 | Registers feature-gated `rem-agent` with side effects and `context_board` access. |
| `/subconscious run` macro | `subconsciousRunCommand(...)` | `Wps(...)`, `Udt` | `app.js` 1295, 1335-1340 | Tells the main agent to call `task` once for a background `rem-agent`. |
| Detached REM process | `spawnDetachedMemoryAgent(...)` | detached `--agent rem-agent` spawn path | `app.js` 4446 | Spawns a detached `copilot --agent rem-agent` during interactive shutdown when eligible. |
| Sidekick launch conditions | Sidekick trigger definitions | native/config-backed conditions | `app.js` 2700-2704 | Launches sidekicks only when configured trigger conditions are met. |
| Sidekick manager | `SidekickAgentManager` | `Iwe` | `app.js` 2700-2704, 2742 | Starts/cancels sidekick agents and publishes their findings through the inbox. |
| REM agent definition | `rem-agent.agent.yaml` | n/a | `copilot-cli-pkg/definitions/rem-agent.agent.yaml` | Defines the memory-consolidation agent prompt parts and `context_board` tool access. |
| Subconscious sidekick | `subconscious-agent.yaml` | n/a | `copilot-cli-pkg/definitions/sidekick/subconscious-agent.yaml` | Reads board entries and forwards relevant content to the inbox. |
| GitHub context sidekick | `github-context.yaml` | n/a | `copilot-cli-pkg/definitions/sidekick/github-context.yaml` | Uses local/GitHub/prior-session tools and sends high-signal context to the inbox. |
| Memory-only GitHub context sidekick | `github-context-memory.yaml` | n/a | `copilot-cli-pkg/definitions/sidekick/github-context-memory.yaml` | Reads service memories, verifies cited local paths, and reacts to context/memory changes. |
| Local session-search sidekick | `session-search.yaml` | `SESSION_SEARCH_SIDEKICK_AGENT` | definition file; `app.js` ~124, 608, 2757 | Queries the local `session_store` through `sql` and publishes at most one inbox entry. |
| Cloud session-search sidekick | `cloud-session-search.yaml` | `CLOUD_SESSION_SEARCH_SIDEKICK_AGENT` | definition file; `app.js` ~124, 608, 2757 | Prefers `session_store_sql`, with the `sql` session-store path as fallback. |

## Architecture at a glance

```mermaid
flowchart TD
    Session["Session startup"] --> Gates{"memory-related gates"}

    Gates -->|agentic memory enabled| ApiCache["Memory API cache"]
    ApiCache --> PromptApi["memory prompt endpoint"]
    PromptApi --> Memories["memory prompt context"]
    PromptApi --> ToolDefs["store/vote tool definitions"]
    Memories --> SystemPrompt["main system prompt"]
    ToolDefs --> MemoryTools["store_memory / vote_memory"]
    MemoryTools --> MemoryPerm["memory permission flow"]
    MemoryPerm --> MemoryService["memory service API"]

    Gates -->|local memory enabled| LocalJson[".github/copilot-memories.jsonl"]
    LocalJson --> LocalStore["local store_memory only"]

    Gates -->|subconscious enabled| BoardInit["dynamic context board config"]
    BoardInit --> Store["session-store DB"]
    Store --> BoardTool["context_board tool"]
    BoardTool --> RemAgent["rem-agent add/prune"]
    BoardTool --> Subconscious["subconscious sidekick get/read"]
    Subconscious --> Inbox["main-agent inbox"]
    RemAgent --> Store
```

There are three important boundaries:

- **Memory API context** can be injected directly into the main system prompt.
- **Memory tools** mutate or curate service/local memory only after validation and permission checks.
- **Dynamic context board entries** are retrieved through `context_board`; the main default agent is normally excluded from direct board access, while specialized agents and sidekicks use it.

## Agentic memory API

The cloud memory path is enabled when the agentic-memory feature is on and the explicit disabled flag is not set. The local memory path is separately enabled by the in-repository memory-store flag.

| Mode | Gate behavior | Storage target | Tool surface |
|---|---|---|---|
| Cloud/service memory | Agentic memory enabled, not disabled; repository or user scope must be resolvable. | Internal memory service API. | `store_memory`; `vote_memory` if the service returns a vote tool definition. |
| Local/in-repository memory | In-repository memory-store flag enabled. | `.github/copilot-memories.jsonl` under the repository root. | `store_memory` only. |
| Test-injected memory | Runtime setting provides injected memory text. | No service dependency. | Prompt memory, optional vote tool for tests. |

### Prompt retrieval and caching

```mermaid
sequenceDiagram
    autonumber
    participant Session as Session
    participant Loader as Memory cache loader
    participant Service as Memory service
    participant Prompt as System prompt builder
    participant Tools as Tool assembly

    Session->>Loader: build settings and tool config
    Loader->>Loader: check cloud memory gate
    Loader->>Loader: resolve repository or user scope
    Loader->>Service: GET internal memory prompt endpoint
    Service-->>Loader: memoriesContext + counts + tool definitions
    Loader->>Loader: cache result by repository name
    Loader-->>Prompt: enabled memory prompt text
    Loader-->>Tools: store/vote tool definitions
    Prompt-->>Session: rendered system prompt includes memories
    Tools-->>Session: memory tools are available when allowed
```

The prompt endpoint returns both **content** and **capabilities**:

- memory prompt text when at least one memory exists;
- memory counts for telemetry and sidekick launch decisions;
- store/vote tool descriptions and definition versions;
- store instructions that can be attached to the `store_memory` tool.

The observed request uses no retry wrapper for the prompt fetch. Failures are logged and converted into disabled memory context for that build instead of blocking the whole session.

The cache is repository-aware:

- if repository scope changes, the cached result and in-flight promise are invalidated;
- if no repository is known and user-scoped memory is not enabled, cloud memory is skipped;
- if HMAC/service settings require repository identity and no repository is known, cloud memory is skipped.

### System prompt injection

The memory prompt text is not a separate user message. It is passed into the main system-prompt builder when the memory API cache says memory is enabled.

```mermaid
flowchart LR
    Cache["memoryApiCache.result"] --> Enabled{"enabled?"}
    Enabled -->|yes| Context["memoriesContext"]
    Enabled -->|no| Empty["no memory section"]
    Context --> Builder["buildSystemPrompt"]
    Empty --> Builder
    Builder --> Current["session currentSystemMessage"]
    Current --> Provider["provider request adapter"]
```

That means model-visible memories are part of the same top-level system context as identity, safety, tool instructions, custom instructions, MCP instructions, and runtime environment context.

## Memory tools

The runtime can expose two model tools:

| Tool | Purpose | Key input requirements | Storage path |
|---|---|---|---|
| `store_memory` | Store a concise fact for future code generation or review tasks. | `subject`, `fact`, `citations`, `reason`, and optionally `scope` when the service definition supports scopes. | Service API or local JSONL strategy. |
| `vote_memory` | Mark an existing memory as useful or incorrect/outdated. | Exact `fact`, `direction` of `upvote` or `downvote`, and `reason`. | Service API only when voting is supported. |

The store flow is defensive:

```mermaid
flowchart TD
    Call["store_memory call"] --> Redact["filter secrets from input"]
    Redact --> Validate{"schema valid?"}
    Validate -->|no| Invalid["failure: invalid inputs"]
    Validate -->|yes| Scope{"scope valid if present?"}
    Scope -->|no| BadScope["failure: invalid scope"]
    Scope -->|yes| Client{"memory client configured?"}
    Client -->|no| Missing["failure: missing client"]
    Client -->|yes| NeedPerm{"permission required?"}
    NeedPerm -->|yes| Ask["memory permission request"]
    NeedPerm -->|no| Store["memory strategy store"]
    Ask --> Approved{"approved?"}
    Approved -->|no| Denied["permission failure result"]
    Approved -->|yes| Store
    Store --> Result["success/failure tool result"]
```

The vote flow is similar, but validates exact fact text, vote direction, and reason. It also verifies that the selected memory strategy actually supports voting.

### Local JSONL memory

The local in-repository strategy is simple and intentionally file-backed:

```mermaid
flowchart TD
    Store["store_memory"] --> MemoryArray["append in-memory item"]
    Shutdown["strategy shutdown"] --> Read["ensure existing JSONL loaded"]
    MemoryArray --> Optimize["optional model optimization"]
    Read --> Optimize
    Optimize --> Write["write .github/copilot-memories.jsonl"]
```

Local memory records include an id, subject, fact, citations, reason, and source metadata. On shutdown, the strategy can optimize the accumulated memories through a model call, then writes one JSON object per line to `.github/copilot-memories.jsonl`.

## Memory permissions

Memory writes and votes are treated as permissioned side effects. The permission kind is `memory`.

The broader permission service, including how `memory` rules interact with deny rules, session/location approvals, allow-all, and prompt/RPC surfaces, is documented in [`tool-path-url-permissions.md`](../03-tools-integrations-security/tool-path-url-permissions.md).

```mermaid
sequenceDiagram
    autonumber
    participant Tool as store_memory/vote_memory
    participant Perm as Permission service
    participant UI as User or client prompt
    participant Strategy as Memory strategy

    Tool->>Perm: request kind=memory, action=store/vote
    Perm->>Perm: check deny rules
    Perm->>Perm: check allow-all/session/location approvals
    alt needs user approval
        Perm->>UI: show memory update prompt
        UI-->>Perm: approve once/session/location or reject
    end
    alt approved
        Perm-->>Tool: approved
        Tool->>Strategy: store or vote
    else denied
        Perm-->>Tool: denial result
    end
```

Observed permission surfaces:

- allow-tool frontmatter and CLI rule parsing map `memory`, `store_memory`, and `vote_memory` to permission kind `memory`;
- deny rules for `memory` block memory updates;
- a session approval stores `{ kind: "memory" }` as an approved rule;
- ACP permission conversion also preserves memory permission requests;
- the TUI prompt shows the fact, citations/scope for store, or direction/reason for vote.

## Dynamic context board

The dynamic context board is a small local board of reusable facts for one repository and branch. It is enabled by the subconscious feature flag and initialized when a session is created or resumed.

```mermaid
flowchart TD
    Create["session create/resume"] --> Flag{"COPILOT_SUBCONSCIOUS?"}
    Flag -->|no| Disabled["no dynamic context config"]
    Flag -->|yes| Repo["resolve repository + branch"]
    Repo --> Fallback["fallback: local absolute cwd + default branch"]
    Fallback --> Store["session-store DB handle"]
    Store --> Config["session.setDynamicContextConfig"]
    Config --> Exclude["default agent excludes context_board"]
    Config --> Count["increment board exposure count on create"]
```

The board stores metadata separately from full content. Metadata is rendered into prompt/context tables; full content requires an explicit tool call.

| Field | Meaning |
|---|---|
| `repository` | Repository identifier or a local-path fallback. |
| `branch` | Git branch or default fallback. |
| `src` | Source of the item, usually `agent` or `user`. |
| `name` | Short kebab-case item identifier. |
| `description` | One-line list summary. |
| `content` | Full reusable context body. |
| `read_count` | Incremented when an item is retrieved with `get`. |
| `count` | Incremented when a new eligible session sees the board. |

### Board rendering

The board formatter emits an XML-like `<dynamic_context_board>` section containing a Markdown table with `src`, `name`, `description`, `read_count`, and `count`. It explicitly tells the model to call `context_board` with `command: "get"` to read full content.

```mermaid
flowchart LR
    DB["dynamic_context_items"] --> Metadata["metadata rows"]
    Metadata --> BoardText["<dynamic_context_board> table"]
    BoardText --> AgentPrompt["agent or sidekick prompt"]
    AgentPrompt --> ToolGet["context_board get"]
    ToolGet --> Full["full content + read_count increment"]
```

## The context_board tool

The `context_board` tool manages dynamic context board entries. It supports four commands:

| Command | Required fields | Behavior |
|---|---|---|
| `get_board` | none | Lists all board items as metadata; returns an empty-board message if none exist. |
| `get` | `src`, `name` | Returns full content for one item and increments `read_count`. |
| `add` | `name`, `description`, `context` | Creates or overwrites an agent-authored item with `src: "agent"`. |
| `prune` | `name` | Deletes an agent-authored item; user-authored items cannot be pruned by this command. |

The board has a capacity limit of `25` entries. The consolidation prompt warns at `23` entries and instructs the worker to prune down to `18` or fewer to leave headroom.

```mermaid
flowchart TD
    Command["context_board command"] --> Kind{"command"}
    Kind --> GetBoard["get_board: list metadata"]
    Kind --> Get["get: require src + name"]
    Kind --> Add["add: require name + description + context"]
    Kind --> Prune["prune: require name"]

    Get --> Exists{"item exists?"}
    Exists -->|yes| ReturnContent["return content; increment read_count"]
    Exists -->|no| NotFound["failure: item not found"]

    Add --> Capacity{"new item and board full?"}
    Capacity -->|yes| Full["failure: prune first"]
    Capacity -->|no| Upsert["upsert src=agent item"]

    Prune --> Delete["delete src=agent item only"]
```

## rem-agent consolidation

`rem-agent` is the built-in memory-consolidation agent. Its YAML definition gives it only the `context_board` tool and includes a special consolidation prompt. It does not include environment context, custom-agent instructions, or parallel-tool-calling prompt parts.

The consolidation prompt builds historical evidence from three sources:

- existing dynamic context board entries;
- session turns stored in the session store;
- the latest checkpoint summary when available.

```mermaid
sequenceDiagram
    autonumber
    participant Runtime as Runtime
    participant Builder as REM system prompt builder
    participant Rem as rem-agent
    participant Board as context_board
    participant Store as dynamic context store

    Runtime->>Builder: build consolidation context
    Builder->>Store: read board metadata/content
    Builder->>Store: read conversation turns and checkpoint
    Builder-->>Rem: historical evidence + output contract
    Rem->>Board: add useful fact/recipe/lesson
    Rem->>Board: prune stale or redundant agent item
    Board->>Store: upsert/delete dynamic_context_items
```

The key instruction is that `rem-agent` is an **offline memory-consolidation worker**. Conversation turns, board entries, and checkpoints are historical evidence, not a new user task. The agent is told to treat file paths and symbols as opaque labels and to output only `context_board` add/prune calls.

## Manual /subconscious run

The manual path starts from a slash command. The command itself does not directly mutate the board. Instead, it returns an agent prompt that tells the main agent to call `task` exactly once.

```mermaid
sequenceDiagram
    autonumber
    participant User as User
    participant Slash as Slash command registry
    participant Main as Main agent
    participant Task as task tool
    participant Rem as rem-agent
    participant Board as context_board

    User->>Slash: /subconscious run
    Slash-->>Main: prompt: launch background rem-agent
    Main->>Task: task(agent_type="rem-agent", mode="background")
    Task-->>Main: background agent started
    Task->>Rem: run with consolidation system prompt
    Rem->>Board: add/prune entries
```

The fixed task name and description observed in the macro are `rem-consolidate` and `Consolidate session learnings`. The prompt explicitly says not to pass extra context because `rem-agent` receives the per-session context in its system prompt.

## Detached shutdown consolidation

The interactive TUI can also start a detached `rem-agent` during shutdown. This is gated by the subconscious feature and a minimum of three user turns.

```mermaid
flowchart TD
    Shutdown["interactive shutdown"] --> Feature{"COPILOT_SUBCONSCIOUS?"}
    Feature -->|no| Normal["normal shutdown"]
    Feature -->|yes| Detached{"already detached child?"}
    Detached -->|yes| SkipChild["skip and emit telemetry"]
    Detached -->|no| Turns{"user messages >= 3?"}
    Turns -->|no| SkipTurns["skip below threshold"]
    Turns -->|yes| Flush["flush session-store tracking"]
    Flush --> Spawn["spawn detached copilot --agent rem-agent"]
    Spawn --> Env["parent session and engagement env vars"]
    Env --> Rem["silent yolo rem-agent run"]
    Rem --> Board["context_board add/prune"]
```

The detached child is launched with:

- `--agent rem-agent`;
- a fixed prompt requesting context-board add/prune updates;
- `--yolo` and `--silent`;
- environment variables linking the child to the parent session and engagement;
- a detached process mode so shutdown does not wait for consolidation to finish.

The shutdown gate emits telemetry for `spawned`, `below_min_turns`, and `detached_child` outcomes.

## Sidekick agents and the inbox

Sidekick agents are background helpers triggered on user messages. They do not answer the user directly. They publish high-signal context into the session inbox, and the main agent can decide whether to read it.

```mermaid
sequenceDiagram
    autonumber
    participant User as User
    participant Manager as Sidekick manager
    participant Sidekick as Sidekick agent
    participant Tools as Tools
    participant Inbox as Inbox
    participant Main as Main agent

    User->>Manager: user.message event
    Manager->>Manager: evaluate feature flag and launch conditions
    Manager->>Sidekick: start background sidekick
    Sidekick->>Tools: inspect board, GitHub, local files, or session store
    Sidekick->>Inbox: send one summarized entry
    Inbox-->>Main: system notification with entry id and summary
    Main->>Inbox: optionally read full entry
```

Five built-in sidekick definitions are relevant here:

| Sidekick | Feature flag | Launch condition | Tools | Role |
|---|---|---|---|---|
| `subconscious-agent` | `COPILOT_SUBCONSCIOUS` | Dynamic context board has entries. | `context_board`, `send_inbox` | Read-only board retrieval. It gets the board, fetches relevant entries, and sends verbatim content to the inbox once per turn. |
| `github-context` | `GITHUB_CONTEXT_SIDEKICK_AGENT_FULL` | Memory is enabled; user-message or working-directory context warrants retrieval. | `read_memories`, local search/read, selected GitHub MCP, `session_store_sql`, `send_inbox` | Gathers optional GitHub, memory, local, or prior-session context. |
| `github-context-memory` | `GITHUB_CONTEXT_SIDEKICK_AGENT` | `memoryEnabled`; user message, context change, or memory change. | `read_memories`, local search/read, `send_inbox` | Retrieves relevant memories and verifies cited local files before publishing. |
| `session-search` | `SESSION_SEARCH_SIDEKICK_AGENT` | Session-store capability and feature assignment. | `sql` with database `session_store`, `send_inbox` | Searches local prior-session history and labels findings as local-store context. |
| `cloud-session-search` | `CLOUD_SESSION_SEARCH_SIDEKICK_AGENT` | Cloud session store and feature assignment. | `session_store_sql`, fallback `sql`, `send_inbox` | Searches prior-session history through the cloud-aware tool when available. |

The session-search variants deliberately do not perform general file exploration: their prompts limit them to prior-session retrieval and tell them to stop when no useful context exists. All five definitions share the sidekick manager's cancellation and inbox path. The manager cancels superseded runs on a newer user turn, enforces per-turn send limits, persists inbox state when a workspace path is available, and sends a system notification with a short summary. The main agent is not forced to read the full inbox entry.

## Prompt-source impact

Memory affects model-visible prompts in several places:

| Source | Prompt impact |
|---|---|
| Memory API prompt context | Injected into the main system prompt when the memory cache is enabled and contains prompt text. |
| Store-tool instructions | Service can provide model-visible instructions for when and how to call `store_memory`. |
| Vote-tool definition | Service can expose `vote_memory` with its own description and schema version. |
| Dynamic context board metadata | Rendered as a compact table that requires explicit `context_board get` for full content. |
| REM consolidation prompt | Built from session turns, latest checkpoint, and board snapshot, then appended to the `rem-agent` system prompt. |
| Inbox notifications | Sidekick messages appear as system notifications telling the main agent that inbox context is available. |

```mermaid
flowchart LR
    MemoryAPI["Memory API"] --> MainPrompt["main system prompt"]
    MemoryAPI --> MemoryTools["store/vote tool descriptions"]
    Board["Dynamic context board"] --> BoardMeta["board metadata prompt"]
    Board --> RemPrompt["rem-agent consolidation prompt"]
    Sidekick["sidekick agents"] --> Inbox["inbox system notifications"]
    MainPrompt --> Model["model request"]
    MemoryTools --> Model
    BoardMeta --> Model
    RemPrompt --> RemModel["rem-agent model request"]
    Inbox --> Model
```

## Persistence summary

| Data | Persistence mechanism | Scope | Notes |
|---|---|---|---|
| Cloud memories | Internal memory service API | Repository or user scope. | Prompt context and store/vote operations are service-backed. |
| Local memories | `.github/copilot-memories.jsonl` | Repository root. | Enabled only by the local memory flag; optimized and written at shutdown. |
| Dynamic context board | `dynamic_context_items` table in the local session store DB | Repository + branch. | Stores metadata and full content; `read_count` and `count` support pruning/relevance decisions. |
| Session turns and checkpoints | Session store tables | Session id. | Used by `rem-agent` to build consolidation evidence. |
| Sidekick inbox | Inbox persistence provider under workspace/session state | Session/workspace. | Used to notify the main agent about sidekick findings. |

## Safety and design takeaways

- Memory updates are permissioned side effects. The model cannot silently store or vote memories when permission is required.
- Inputs to memory tools are passed through the secret filter before validation and storage.
- The memory API prompt fetch is fail-soft: failure disables memory context for that build rather than failing the session.
- The dynamic context board is deliberately small. The runtime uses capacity warnings, read counts, and pruning to keep it high-signal.
- The default main agent is not normally given direct `context_board` access after board initialization. `rem-agent` and sidekicks are the intended board actors.
- `rem-agent` does not re-open or verify files during consolidation. Its prompt tells it to treat historical paths and symbols as opaque labels.
- Sidekicks communicate through the inbox, not through direct hidden state sharing. The main agent remains the final judge of whether sidekick context is useful.

Related docs: [`prompt-sources.md`](prompt-sources.md), [`agent-task-orchestration.md`](../06-agents-automation/agent-task-orchestration.md), [`tool-path-url-permissions.md`](../03-tools-integrations-security/tool-path-url-permissions.md), [`feature-gates.md`](../05-hosted-agent-ops/feature-gates.md), [`telemetry-update-and-shutdown.md`](../05-hosted-agent-ops/telemetry-update-and-shutdown.md), and [`sessions-remote-cloud.md`](../04-sessions-persistence-remote/sessions-remote-cloud.md).