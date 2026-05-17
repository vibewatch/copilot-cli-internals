# Tools, integrations, and security

This chapter combines three concerns that are inseparable in an agent runtime:

1. Which capabilities become model-visible tools?
2. Which external systems contribute tools, prompts, hooks, or agents?
3. Which trust boundaries approve, deny, redact, sandbox, or persist policy?

Read this chapter when the question is: **why could the model do that, and what guarded the action?**

## Source-anchor policy

This page is a chapter guide. Linked implementation pages carry concrete `app.js` anchors.

| Semantic alias | Minified anchor | Scope |
|---|---|---|
| Tools/integrations/security chapter | N/A — navigation page | Groups runtime tool assembly, execution, MCP/plugins/SDK/IDE/web integrations, permissions, redaction, hooks, sandboxing, and policy state. |
| Tool/security implementation pages | See linked source-anchor tables | Concrete bundle anchors live in the destination pages. |

## Trust-boundary map

```mermaid
flowchart TD
    Session[Session options and model config] --> Assembly[Runtime tool assembly]
    MCP[MCP servers] --> Assembly
    Plugins[Plugins / SDK / IDE] --> Assembly
    Builtins[Built-in tools] --> Assembly
    Assembly --> Model[Model-visible schemas]
    Model --> Call[Tool call]
    Call --> Permission[Permission service]
    Permission --> Hooks[Hooks and policy]
    Hooks --> Exec[Tool execution]
    Exec --> Redaction[Content exclusion / redaction]
    Exec --> Sandbox[Sandbox / process boundary]
    Redaction --> Events[Events / telemetry / history]
    Sandbox --> Events

    click Assembly "./runtime-tool-assembly-and-filtering/" "Open runtime tool assembly"
    click Exec "./built-in-tool-execution-pipeline/" "Open tool execution"
    click MCP "./mcp-support-implementation/" "Open MCP support"
    click Permission "./permission-system-design/" "Open permission system"
    click Redaction "./content-exclusion-and-redaction/" "Open content exclusion"
    click Sandbox "./sandboxing/" "Open sandboxing"
```

## Primary reading order

| Order | Page | Tool/security question answered |
|---:|---|---|
| 1 | [Runtime tool assembly and filtering](runtime-tool-assembly-and-filtering.md) | How are built-ins, MCP, SDK extensions, plugins, custom agents, filters, deferred search, and gates assembled into the final toolset? |
| 2 | [Built-in tool execution pipeline](built-in-tool-execution-pipeline.md) | How do permission checks, hooks, execution events, streaming, telemetry, and history wrap a tool call? |
| 3 | [Shell command execution lifecycle](shell-command-execution-lifecycle.md) | How do Bash/PowerShell tools choose PTY/process backends, async/detached behavior, task tracking, and large-output handling? |
| 4 | [MCP support implementation](mcp-support-implementation.md) | How are MCP servers discovered, transported, authorized, filtered, and mapped into tools/resources/prompts/tasks? |
| 5 | [Permission system design](permission-system-design.md) | How do tool/path/URL/MCP/hook approval rules and precedence work? |
| 6 | [Content exclusion and redaction](content-exclusion-and-redaction.md) | How do policy fetch/merge, filtered outputs, secret env vars, and redaction boundaries affect model-visible data? |
| 7 | [Sandbox implementation](sandboxing.md) | How does local command sandboxing route shell sessions through MXC helpers and filesystem policies? |

## Integration providers

| Provider | Page | Runtime surface |
|---|---|---|
| Plugins | [Plugin and extension architecture](plugin-extension-architecture.md) | Plugin caches, marketplaces, contributed skills/agents/hooks/MCP/LSP, and enablement state. |
| Programmatic SDK extensions | [Copilot SDK extension support](copilot-sdk-extension-support.md) | `@github/copilot-sdk` extension discovery, `joinSession()`, management APIs, events, and trust boundaries. |
| IDE/LSP/editor bridges | [IDE, LSP, and editor integration](ide-lsp-editor-integration.md) | IDE tools, selections, diagnostics, diffs, title sync, LSP config, and extension state. |
| Web/GitHub network access | [Web search, URL fetching, and URL permissions](web-search-url-fetching.md) | Built-in web fetch, GitHub MCP web search, URL allow/deny persistence, and web gates. |
| Validation/review tools | [Coding-agent validation and review toolchain](coding-agent-validation-toolchain.md) | Code review, CodeQL, secret scanning, advisory checks, budgets, and validation telemetry. |

## Policy and persistence topics

- [Hooks and lifecycle automation](hooks-lifecycle-automation.md) explains command/HTTP hooks, VS Code aliases, security restrictions, and lifecycle events.
- [Settings and configuration persistence](settings-config-persistence.md) explains config roots, typed stores, settings overlays, URL/MCP/plugin/sandbox state, and migration behavior.
- [MXC binary reverse-engineering notes](mxc-bin-reverse-engineering.md) documents bundled sandbox helper binaries and platform implications.

## Handoffs

- Tool schemas and tool results feed the [Context and model loop](../02-context-model-loop/README.md).
- Tool execution events and large output artifacts are persisted by [Sessions, persistence, and remote](../04-sessions-persistence-remote/README.md).
- Hosted GitHub MCP policy and OIDC token injection are covered by [Hosted agent ops](../05-hosted-agent-ops/README.md).
- Agent-specific tool subsets and task handoff are covered by [Agents and automation](../06-agents-automation/README.md).

## Navigation

- [Start here](../00-start-here/README.md)
- [Full table of contents](../SUMMARY.md)
