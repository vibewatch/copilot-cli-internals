# Runtime lifecycle

This chapter follows the bundle from process start to cleanup. It is the right entry point for questions about package loading, root command routing, TUI/prompt/server modes, terminal integration, voice/runtime workers, protocol servers, rendering support, update behavior, and shutdown.

The runtime lifecycle is the outer harness around the model loop: it decides **which mode runs**, prepares shared services, connects to sessions/tools, and guarantees cleanup when execution ends.

## Source-anchor policy

This page is a chapter guide. The linked implementation pages carry concrete `app.js` anchors.

| Semantic alias | Minified anchor | Scope |
|---|---|---|
| Runtime lifecycle chapter | N/A — navigation page | Groups startup, command routing, mode dispatch, terminal/protocol support, voice workers, rendering, and cleanup. |
| Runtime implementation pages | See linked source-anchor tables | Concrete bundle anchors live in the destination pages. |

## Runtime flow

```mermaid
flowchart TD
    Loader[Loader/bootstrap] --> Binary[Native runtime binary]
    Binary --> Native[In-process/OOP bridge]
    Native --> Root[Root command and pre-action setup]
    Root --> Dispatch{Runtime mode}
    Dispatch --> TUI[Interactive TUI]
    Dispatch --> Prompt[Prompt/stdin/non-TTY]
    Dispatch --> Server[JSON-RPC/headless server]
    Dispatch --> ACP[ACP server]
    Dispatch --> Commands[Subcommands]
    TUI --> Sessions[Session runtime]
    Prompt --> Sessions
    Server --> Sessions
    ACP --> Sessions
    Sessions --> Shutdown[Shutdown/update/logging cleanup]

    click Loader "./loader-bootstrap/" "Open loader and bootstrap"
    click Binary "./native-runtime-binary/" "Open native runtime binary architecture"
    click Native "./out-of-process-native-runtime/" "Open native runtime bridge"
    click Root "./mode-dispatch-and-runtime-startup/" "Open Mode dispatch and runtime startup"
    click TUI "./tui-and-slash-commands/" "Open TUI and slash commands"
    click Server "./embedded-server-acp-protocol/" "Open embedded server and ACP"
    click Shutdown "../05-hosted-agent-ops/telemetry-update-and-shutdown/" "Open observability and shutdown"
```

## Primary reading order

| Order | Page | Runtime question answered |
|---:|---|---|
| 1 | [Loader and bootstrap workflows](loader-bootstrap.md) | How does the SEA/npm package select and load the actual runtime bundle? |
| 2 | [Native `runtime.node` binary architecture](native-runtime-binary.md) | What native API families, handle classes, Rust modules, and provider/host ABI are recoverable from the stripped addon? |
| 3 | [Out-of-process native runtime bridge](out-of-process-native-runtime.md) | How can JavaScript use a Rust-parent native surface instead of loading `runtime.node` in-process? |
| 4 | [Mode dispatch and runtime startup](mode-dispatch-and-runtime-startup.md) | How do argv, stdin, TTY, settings, auth, and sessions choose the execution mode? |
| 5 | [Interactive TUI and slash-command workflows](tui-and-slash-commands.md) | How does the terminal UI handle input, rendering, slash commands, dialogs, and permissions? |
| 6 | [Embedded server, ACP, and JSON-RPC protocol](embedded-server-acp-protocol.md) | How does the CLI expose runtime/session capabilities to external hosts? |
| 7 | [Telemetry, update, and shutdown](../05-hosted-agent-ops/telemetry-update-and-shutdown.md) | How are logs, telemetry, update/version behavior, signals, disposables, and graceful exit coordinated? |

## Runtime support topics

| Topic | Page | Why it belongs here |
|---|---|---|
| Terminal ergonomics | [Terminal setup and shell environment](terminal-setup-and-shell-environment.md) | Defines shell detection, Shift+Enter setup, history state, and command-environment context. |
| Unicode and desktop integration | [CLI native Unicode and desktop helper](cli-native-platform-helper.md) | Maps grapheme-safe layout, cell-width properties, OS theme observation, and desktop notifications in `cli-native.node`. |
| Syntax and diff rendering | [Tree-sitter WASM usage](tree-sitter-wasm-usage.md) | Explains packaged grammars, highlight queries, and rendering fallbacks. |
| Voice entry point | [Voice mode and Foundry Local](voice-mode-foundry-local.md) | Covers voice mode activation, Foundry Local checks, settings, and native modules. |
| Voice backend | [Voice runtime server and transcription pipeline](voice-runtime-workers-and-transcription.md) | Traces the dedicated local engine, endpoint reuse/spawn, settings handoff, installation, and historical worker migration. |

## Handoffs

- After mode dispatch, continue to [Sessions, persistence, and remote](../04-sessions-persistence-remote/README.md) for durable event/state behavior.
- For provider requests, continue to [Context and model loop](../02-context-model-loop/README.md).
- For tool exposure and permission boundaries, continue to [Tools, integrations, and security](../03-tools-integrations-security/README.md).
- For hosted-job environment contracts, continue to [Hosted agent ops](../05-hosted-agent-ops/README.md).

## Navigation

- [Start here](../00-start-here/README.md)
- [Full table of contents](../SUMMARY.md)
