# Mode dispatch and runtime startup

This file documents the key control flow inside the tail section of `app.js`, where the root `copilot` command is assembled and executed.

The root program is built through a Commander-like API and ends with:

- registering options and subcommands;
- installing a `preAction` hook;
- installing a top-level async action;
- calling `parseAsync(...)`.

This is the central dispatch page for [Runtime lifecycle](README.md). It connects loader/bootstrap output to TUI, prompt, server/headless, ACP, and subcommand paths. After this page, follow [Interactive TUI and slash-command workflows](tui-and-slash-commands.md) for human terminal operation, [Embedded server, ACP, and JSON-RPC protocol](embedded-server-acp-protocol.md) for protocol hosts, or [Conversation session end-to-end](../04-sessions-persistence-remote/conversation-session-end-to-end.md) for durable session behavior.

## Source anchors

`app.js` is bundled and minified, so the semantic aliases below are documentation names. The minified anchors are lookup aids for this analyzed bundle only.

| Semantic alias | Minified anchor | Approx. `app.js` line | Role |
|---|---|---:|---|
| Root program builder | `mke` | 8221 | Commander-like root `copilot` program object. |
| Root runtime action | root `.action(async t => { ... })` | 8221-8347 | Main option normalization, service initialization, session resolution, and mode dispatch. |
| Interactive TUI workflow | `j$o(...)` | 7344 | Launches the terminal UI flow and embedded session wiring. |
| Non-interactive prompt workflow | `u1t(...)` | 7344 | Runs prompt mode for direct prompts, stdin, and non-TTY execution. |
| Server/headless branch | `--server`, `--headless`, dynamic server import | 8225-8347 | Starts JSON-RPC/headless server mode after shared initialization. |
| ACP branch | `--acp`, dynamic ACP import | 8225-8347 | Starts Agent Client Protocol mode after shared initialization. |

## Root parse flow

```mermaid
flowchart TD
    Start["app.js evaluated"] --> BuildProgram["build RootProgram"]
    BuildProgram --> AddMetadata["name, summary, description, version"]
    AddMetadata --> AddOptions["register root options"]
    AddOptions --> AddHelpTopics["register help topics"]
    AddHelpTopics --> AddSubcommands["login, mcp, plugin, completion, init, update, version, help"]
    AddSubcommands --> RegisterPreAction["hook preAction"]
    RegisterPreAction --> RegisterAction["top-level action"]
    RegisterAction --> Parse["parseAsync"]
    Parse --> CommanderDispatch{"root action or subcommand?"}
    CommanderDispatch -- subcommand --> Subcommand["run selected subcommand action"]
    CommanderDispatch -- root --> MainAction["run main app action"]
```

## `preAction` setup

The `preAction` hook prepares configuration paths before command actions run. It handles `COPILOT_HOME`, deprecated `--config-dir`, and settings migration.

```mermaid
flowchart TD
    PreAction["preAction hook"] --> HomeCheck{"COPILOT_HOME set?"}
    HomeCheck -- no --> XdgMigration["run XDG migration helper"]
    HomeCheck -- yes --> UseHome["use COPILOT_HOME"]
    XdgMigration --> ConfigDir["resolve deprecated --config-dir if present"]
    UseHome --> ConfigDir
    ConfigDir --> SettingsMigration["migrate old config keys to settings.json"]
    SettingsMigration --> Continue["continue to selected action"]
```

## Main top-level action

The root `.action(async t => { ... })` is the primary runtime path for interactive and prompt use. It also routes to server and ACP modes.

```mermaid
sequenceDiagram
    autonumber
    participant CLI as CLI parser
    participant Main as app.js main action
    participant Config as Config/state
    participant Services as Core services
    participant Auth as Auth manager
    participant Session as Session managers
    participant Mode as Mode router

    CLI->>Main: parsed options
    Main->>Main: normalize debug, color, diff, config flags
    Main->>Config: load config and state
    Main->>Services: initialize feature flags, logging, telemetry, errors
    Main->>Auth: initialize auth manager
    Main->>Services: register shutdown callbacks
    Main->>Main: validate cloud/offline/provider constraints
    Main->>Services: prepare auto-update and completions side effects
    Main->>Main: parse MCP, plugins, attachments, permissions
    Main->>Session: create local and optional remote managers
    Main->>Session: resolve new/resumed/continued/connected session
    Main->>Mode: dispatch to server, ACP, interactive, or prompt mode
```

## Main runtime phases

```mermaid
flowchart TD
    A["root action receives options"] --> B["load config and persistent state"]
    B --> C["detect repository and workspace"]
    C --> D["apply experimental/settings overrides"]
    D --> E["initialize feature flags"]
    E --> F["initialize auth manager"]
    F --> G["create shutdown service"]
    G --> H["configure logging and telemetry"]
    H --> I["validate cloud/offline/BYOK/provider constraints"]
    I --> J["configure auto-update and shell completions"]
    J --> K["load MCP, plugins, content exclusion, attachments"]
    K --> L["assemble permissions and URL/path rules"]
    L --> M["create local session manager"]
    M --> N["create or attach remote session manager if enabled"]
    N --> O["resolve session target"]
    O --> P["dispatch runtime mode"]
```

## Execution-mode router

The most important branch in the root action decides which runtime mode owns execution.

```mermaid
flowchart TD
    Prepared["runtime initialized"] --> ServerCheck{"--server or --headless?"}

    ServerCheck -- yes --> ServerMode["dynamic import and startServerMode"]
    ServerMode --> Stop["return from root action"]

    ServerCheck -- no --> ACPCheck{"--acp?"}
    ACPCheck -- yes --> ACPMode["dynamic import and startACPMode"]
    ACPMode --> Stop

    ACPCheck -- no --> PromptInputs["evaluate prompt flags, stdin, TTY"]
    PromptInputs --> InteractiveCheck{"interactive terminal without direct prompt?"}

    InteractiveCheck -- yes --> TUI["InteractiveTuiFlow"]
    InteractiveCheck -- no --> DirectPrompt["runPromptMode non-interactive prompt"]

    TUI --> Save["save session and shutdown cleanly"]
    DirectPrompt --> Save
```

## Session-resolution workflow

The root action supports several ways to pick a session: new local session, continue last session, resume by ID/name/task, connect to remote, and cloud mode. Exact lookup internals are bundled, but the high-level decision pattern is visible from the CLI action.

```mermaid
flowchart TD
    Start["session options parsed"] --> RemoteEnabled{"remote/cloud feature enabled?"}
    RemoteEnabled -- yes --> RemoteManager["initialize remote session manager"]
    RemoteEnabled -- no --> LocalOnly["local session manager only"]

    RemoteManager --> Inputs["inspect --cloud, --connect, --continue, --resume, --name"]
    LocalOnly --> Inputs

    Inputs --> ConnectCheck{"--connect provided?"}
    ConnectCheck -- yes --> ConnectRemote["connect to remote session or picker"]
    ConnectCheck -- no --> ContinueCheck{"--continue?"}

    ContinueCheck -- yes --> ContinueSession["select most recent session"]
    ContinueCheck -- no --> ResumeCheck{"--resume value?"}

    ResumeCheck -- yes --> ResumeLookup["lookup by id, prefix, name, or task"]
    ResumeCheck -- no --> CloudCheck{"--cloud?"}

    CloudCheck -- yes --> CloudSession["create or select cloud-backed session"]
    CloudCheck -- no --> NewSession["create new local session"]

    ConnectRemote --> InitialSession["initial session for mode"]
    ContinueSession --> InitialSession
    ResumeLookup --> InitialSession
    CloudSession --> InitialSession
    NewSession --> InitialSession
```

## Interactive TUI workflow

The interactive branch (`InteractiveTuiFlow`) creates a terminal UI, optionally starts an embedded server, registers extension tooling, moves into the alternate screen, and renders the React/Ink-like UI tree.

```mermaid
sequenceDiagram
    autonumber
    participant Root as root action
    participant TUI as InteractiveTuiFlow
    participant Session as foreground session
    participant Embedded as embedded server
    participant UI as terminal renderer
    participant Shutdown as shutdown service

    Root->>TUI: pass services, config, permissions, session
    TUI->>Embedded: optionally start TCP embedded server
    TUI->>Embedded: register foreground session
    TUI->>Session: defer session end and set initial mode
    TUI->>UI: enter alternate screen and mount UI tree
    TUI->>Shutdown: register session-end and renderer cleanup callbacks
    UI-->>Session: user prompts, approvals, commands, attachments
    Session-->>UI: events, tool requests, model responses
    Shutdown->>Session: fire session end hooks
    Shutdown->>UI: unmount and restore terminal
```

## Non-interactive prompt workflow

Prompt mode (`runPromptMode(...)`) is used when a prompt is supplied directly, stdin is piped, or the CLI is otherwise not in an interactive TTY path.

```mermaid
sequenceDiagram
    autonumber
    participant Root as root action
    participant Prompt as runPromptMode
    participant Session as session
    participant Permissions as permission service
    participant Tools as tools and extensions
    participant Output as stdout/stderr/export

    Root->>Prompt: prompt text, session, config, permissions
    Prompt->>Session: configure non-interactive options
    Prompt->>Permissions: install approve/deny rules
    Prompt->>Tools: initialize and validate tools
    Prompt->>Session: send prompt and attachments
    Session-->>Prompt: stream or collect model/tool events
    Prompt->>Session: wait for pending background tasks
    Prompt->>Output: render metrics unless silent
    Prompt->>Session: save session
    Prompt->>Output: optional export to markdown or gist
```

A notable non-interactive behavior is that permission requests cannot ask the user unless explicitly supported by the mode. If no allow rule applies, many requests are resolved as unavailable/denied rather than prompting.

## Server and ACP branches

Server/headless and ACP modes are loaded dynamically only when their flags are selected. They reuse the same initialization work from the root action, then hand control to protocol-specific modules.

```mermaid
flowchart TD
    RootInitialized["root action initialized services"] --> ServerFlag{"server/headless flag"}
    RootInitialized --> ACPFlag{"ACP flag"}

    ServerFlag -- true --> ImportServer["dynamic import server module"]
    ImportServer --> StartServer["startServerMode with managers, auth, settings, features"]

    ACPFlag -- true --> ImportACP["dynamic import ACP module"]
    ImportACP --> StartACP["startACPMode with session and services"]

    StartServer --> ProtocolLoop["JSON-RPC / stdio / headless handling"]
    StartACP --> ACPProtocol["Agent Client Protocol handling"]
```

## Shutdown workflow

`app.js` uses a dedicated `ShutdownService` that tracks disposables and callbacks. It logs each disposal attempt, supports pre/post shutdown callbacks, flushes logs/output, and force-exits after a timeout.

```mermaid
flowchart TD
    ShutdownRequested["shutdown requested"] --> Already{"already shutting down?"}
    Already -- yes --> Ignore["ignore duplicate request"]
    Already -- no --> Mark["mark isShuttingDown"]
    Mark --> Timer["start force-exit timeout"]
    Timer --> Pre["run pre-shutdown callbacks"]
    Pre --> Disposables["dispose registered services in parallel"]
    Disposables --> Post["run post-shutdown callbacks"]
    Post --> Flush["flush logs and streams"]
    Flush --> Exit["process.exit(code)"]
```
