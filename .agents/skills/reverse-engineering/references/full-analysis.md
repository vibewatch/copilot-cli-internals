# Full Analysis Mode

Use full analysis for broad or first-time reconstruction of a runtime subsystem. This mode reads the bundle directly, uses `source-atlas/` only as a discovery aid, and produces source-anchored docs or a confirmed gap assessment.

## Typical Targets

- Model and provider routing.
- Request resilience, rate limits, retries, and concurrency.
- Tool registration, filtering, and execution lifecycle.
- Shell command execution and sandbox routing.
- Permissions and approval flows.
- Sessions, remote APIs, JSON-RPC, SessionFs, and session-state files.
- Tasks, subagents, autopilot, and completion criteria.
- Observability, updates, shutdown, diagnostics, or telemetry.

## Procedure

1. Define the target subsystem and expected user-visible behavior.
2. Audit existing docs before touching `app.js`; classify the topic as already covered, partially covered, schema-only, or missing.
3. If `source-atlas/summary.json` is missing or obviously stale, regenerate the atlas with `node scripts/index-app-js.mjs` before deep source reads.
4. Build a narrow anchor plan from semantic subsystem words, generated API names, known minified aliases, event strings, JSON-RPC methods, and adjacent co-occurring terms.
5. Read focused `app.js` ranges around promising anchors and follow the path outward through constructors, factories, entry points, branches, event emission, persistence, cleanup, and SDK/schema boundaries.
6. Triangulate with adjacent files when the minified bundle alone is ambiguous:
   - `copilot-cli-pkg/copilot-sdk/index.js`
   - `copilot-cli-pkg/copilot-sdk/*.d.ts`
   - `copilot-cli-pkg/schemas/`
   - `copilot-cli-pkg/definitions/`
   - `help/*.txt`
7. Reconstruct a concise runtime map with entry point, main runtime object or function, branch conditions, downstream calls, events, errors, cleanup, and user-visible implications.
8. Decide whether to patch an existing page, create a focused companion page, or only record a candidate gap.

## Runtime Map Template

| Step | Runtime anchor | What happens | Documentation implication |
|---|---|---|---|
| 1 | `symbol` in `copilot-cli-pkg/app.js` around an approximate line | Confirmed behavior | Why the behavior matters to readers |

Add a small Mermaid diagram only when it clarifies the flow better than a table.

## Full Analysis Quality Checks

- The source range is large enough to identify the enclosing function/class and nearby callers or callees.
- Runtime behavior is confirmed in source, not inferred only from schemas or string constants.
- Minified aliases and semantic names are both recorded.
- Existing docs are extended or cross-linked when possible.
- Any uncertain interpretation is labeled as a candidate gap, not documented as fact.