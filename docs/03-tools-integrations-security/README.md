# Tools, integrations, and security

This MVP section puts the model-visible tool surface and the trust boundary in one place. Read it when asking why a tool exists, how it executes, what external systems can extend it, and which permission/redaction/sandbox checks apply.

## Semantic alias and minified anchor mapping

This is a navigation page. Linked implementation pages carry concrete `app.js` anchors.

| Semantic alias | Minified anchor | Scope |
|---|---|---|
| Tools/integrations/security section | N/A — navigation page | Groups tool assembly/execution, MCP/plugins/SDK/IDE/web bridges, permissions, redaction, hooks, sandboxing, and persistent policy state. |
| Tool/security implementation pages | See linked topic pages | Concrete bundle anchors live in the destination pages. |

## Primary path

| Order | Page | Covers |
|---:|---|---|
| 1 | [Runtime tool assembly and filtering](runtime-tool-assembly-and-filtering.md) | Built-ins, MCP, SDK extensions, plugins, custom agents, allow/exclude filters, deferred search, and final toolsets. |
| 2 | [Built-in tool execution pipeline](built-in-tool-execution-pipeline.md) | Permission/hook flow, execution events, streaming, and telemetry. |
| 3 | [Shell command execution lifecycle](shell-command-execution-lifecycle.md) | Bash/PowerShell tools, PTY vs process backends, async tasks, detached commands, and large output. |
| 4 | [MCP support implementation](mcp-support-implementation.md) | MCP config discovery, transports, lifecycle, OAuth, permissions, resources, prompts, and tasks. |
| 5 | [Permission system design](permission-system-design.md) | Tool/path/URL/MCP/hook approval policy and rule precedence. |
| 6 | [Content exclusion and redaction](content-exclusion-and-redaction.md) | Policy fetch/merge, filtered outputs, secret env vars, and redaction boundaries. |
| 7 | [Sandbox implementation](sandboxing.md) | Local command sandboxing, `/sandbox`, MXC helpers, and platform caveats. |

## Integration providers

- [Plugin and extension architecture](plugin-extension-architecture.md)
- [Copilot SDK extension support](copilot-sdk-extension-support.md)
- [IDE, LSP, and editor integration](ide-lsp-editor-integration.md)
- [Web search, URL fetching, and URL permissions](web-search-url-fetching.md)
- [Coding-agent validation and review toolchain](coding-agent-validation-toolchain.md)
- [Hooks and lifecycle automation](hooks-lifecycle-automation.md)
- [Settings and configuration persistence](settings-config-persistence.md)
- [MXC binary reverse-engineering notes](mxc-bin-reverse-engineering.md)

## Back to MVP start

- [Start here](../00-start-here/README.md)
