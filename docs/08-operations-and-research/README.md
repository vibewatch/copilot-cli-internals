# Operations and research

Feature gates, generated source indexes, diagnostics, debug bundles, observability/update/shutdown, and the original documentation backlog.

## Semantic alias and minified anchor mapping

This is a section index, not a direct `app.js` implementation analysis. Topic pages linked below carry the concrete bundle mappings.

| Semantic alias | Minified anchor | Scope |
|---|---|---|
| Operations and research section index | N/A — navigation page | Groups feature gates, source-index generation, diagnostics, observability, and documentation-research docs. |
| Operations and research topic pages | See linked page-level mappings | Concrete `app.js` anchors are documented in the child pages. |

## How this section fits

Click a node in the map to jump to that page or related section.

```mermaid
flowchart TD
    Gates[Feature gates] --> Runtime[Runtime behavior]
    Atlas[app.js source atlas] --> Research[Documentation opportunities]
    Runtime --> Observability[Logs/telemetry/shutdown]
    Runtime --> Diagnostics[Diagnostics/debug bundles]
    Research[Documentation opportunities] --> Backlog[Future niche follow-ups]

    click Gates "./feature-gates/" "Open feature gates"
    click Atlas "./app-js-source-atlas/" "Open app.js source atlas"
    click Runtime "../01-runtime-and-ui/cli-runtime-workflows/" "Open CLI runtime workflows"
    click Observability "./observability-update-shutdown/" "Open observability and shutdown"
    click Diagnostics "./diagnostics-feedback-debug-bundles/" "Open diagnostics and debug bundles"
    click Research "./documentation-opportunities/" "Open documentation opportunities"
    click Backlog "./documentation-opportunities/" "Open future follow-ups"
```

## Pages

| Page | Why read it | File |
|---|---|---|
| [Feature gates and rollout logic in Copilot CLI](./feature-gates.md) | Gate tiers, rollout inputs, env/settings overrides, remote experiments, repo/team allowlists, and MCP permission gates. | `feature-gates.md` |
| [`app.js` source atlas and generated indexes](./app-js-source-atlas.md) | Generated `app.js` symbol/string inventories, main runtime path seeds, semantic anchor seeds, and regeneration workflow. | `app-js-source-atlas.md` |
| [Diagnostics, feedback, and debug bundles](./diagnostics-feedback-debug-bundles.md) | /diagnose, /feedback, /bug, /collect-debug-logs, .tgz bundles, secret gist uploads, and debug-log paths. | `diagnostics-feedback-debug-bundles.md` |
| [Observability, update, and shutdown workflows](./observability-update-shutdown.md) | Logging, telemetry, OpenTelemetry, debug artifacts, update/version paths, and graceful shutdown. | `observability-update-shutdown.md` |
| [Further documentation opportunities for Copilot CLI](./documentation-opportunities.md) | Historical scan report, implemented backlog, command surfaces, and future niche follow-ups. | `documentation-opportunities.md` |

## Reading guidance

- Operational docs explain gates, logging, diagnostics, and shutdown.
- Use the source atlas before diving into raw `app.js`; it points from strings/symbols to the focused wiki pages.
- The research backlog is retained as historical methodology and future niche ideas.

## Back to wiki home

- [Wiki home](../README.md)
- [Full table of contents](../SUMMARY.md)
