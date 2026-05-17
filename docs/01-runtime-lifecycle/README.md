# Runtime lifecycle

This MVP section explains how the extracted CLI starts, chooses a mode, renders UI/protocol surfaces, and shuts down. It combines runtime, user-interface, protocol, and operational lifecycle topics into a single first-principles path.

## Semantic alias and minified anchor mapping

This is a navigation page. Linked implementation pages carry concrete `app.js` anchors.

| Semantic alias | Minified anchor | Scope |
|---|---|---|
| Runtime lifecycle section | N/A — navigation page | Groups loader, command routing, interactive/headless/server modes, terminal ergonomics, protocol servers, rendering, and shutdown. |
| Runtime implementation pages | See linked topic pages | Concrete bundle anchors live in the destination pages. |

## Primary path

| Order | Page | Covers |
|---:|---|---|
| 1 | [Loader and bootstrap workflows](loader-bootstrap.md) | SEA/npm loader chain, restart wrapper, secure module loading, and bootstrap safeguards. |
| 2 | [CLI runtime workflows](cli-runtime-workflows.md) | Root command routing, pre-action setup, prompt/headless/server dispatch, and session resolution. |
| 3 | [Interactive TUI and slash-command workflows](tui-and-slash-commands.md) | TUI event loop, dialogs, slash commands, and permission-facing UX. |
| 4 | [Embedded server, ACP, and JSON-RPC protocol](embedded-server-acp-protocol.md) | JSON-RPC/ACP server modes, external calls, elicitation, sampling, and commands. |
| 5 | [Observability, update, and shutdown workflows](../05-hosted-agent-ops/observability-update-shutdown.md) | Logging, telemetry, update/version paths, shutdown, and cleanup. |

## Supporting runtime topics

- [Terminal setup and shell environment](terminal-setup-and-shell-environment.md)
- [Tree-sitter WASM usage](tree-sitter-wasm-usage.md)
- [Voice mode and Foundry Local](voice-mode-foundry-local.md)
- [Voice runtime workers and transcription pipeline](voice-runtime-workers-and-transcription.md)

## Back to MVP start

- [Start here](../00-start-here/README.md)
