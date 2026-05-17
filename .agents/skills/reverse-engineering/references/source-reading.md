# Source Reading and Anchor Handling

Use this reference for precise searches, source anchors, semantic aliasing, and minified-code interpretation.

## Source Material Trust Model

Use source layers according to their evidentiary role:

| Source | Role | Trust model |
|---|---|---|
| `copilot-cli-pkg/app.js` | Main runtime bundle. | Highest value for runtime behavior, but minified and hard to read directly. |
| `copilot-cli-pkg/package.json` | Package identity and version context. | Useful for anchoring the analyzed artifact and package-version deltas. |
| `copilot-cli-pkg/definitions/*.agent.yaml` | Built-in agent definitions. | Confirms packaged agent prompts and metadata loaded by the runtime. |
| `copilot-cli-pkg/builtin-skills/**/SKILL.md` | Built-in skill instructions. | Packaged prompt material, not inline JavaScript behavior by itself. |
| `copilot-cli-pkg/copilot-sdk/**` and `copilot-cli-pkg/schemas/**` | SDK and session/event contracts. | Confirms external API and event schema surfaces. |
| `help/*.txt` | Captured CLI help text. | Confirms user-facing commands, flags, and help wording. |
| `source-atlas/` | Generated symbol/string/event index. | Triage layer only; atlas hits are leads, not proof. |
| `docs/` | Current internals wiki. | Starting point for gap analysis, duplication checks, and reader-boundary decisions. |

Runtime source beats schema-only conclusions. Adjacent files confirm contracts and user-facing surfaces, but they do not prove lifecycle, enforcement, or cleanup without a source path through `app.js` or a delegated runtime module.

## Build a Narrow Anchor Plan

Prefer specific terms that should co-occur in the target path:

- Semantic subsystem words such as `sessionFs`, `initializeAndValidateTools`, `getCompletionWithTools`, `permission`, `task`, `shell`, or `mcp`.
- Generated API names from SDK files or schemas.
- Known minified aliases from existing docs or previous source reads.
- Event names, JSON-RPC-ish methods, slash commands, environment variables, and feature keys.
- Adjacent concepts that should appear in the same call path.

In incremental mode, seed the plan from `source-atlas/` diffs first: changed events, env vars, command candidates, JSON-RPC-ish methods, feature gates, tool hits, packaged definitions, and moved semantic anchors.

Effective discovery patterns include:

- Constants-first discovery for hosted-agent env vars, feature gates, event names, and operation toggles.
- Event-driven tracing for sessions, tools, permissions, MCP, and task completion.
- Command and flag tracing for TUI, prompt mode, MCP management, sandboxing, scheduled prompts, and permissions.
- Adjacent-file confirmation for agent YAML, built-in skills, SDK extension contracts, schemas, and help output.

## Search Practices

- Use alternation-style searches to collect a map of likely anchors in one pass.
- Avoid vague searches such as `run`, `tool`, `session`, or `agent` unless paired with aliases or API names.
- Prefer focused file reads around likely anchors over repeated full-bundle scans.
- Keep exact string literals and minified symbol names intact in notes.

## Reading Source Ranges

For each promising anchor:

1. Read enough surrounding source to identify the enclosing function/class, local data structures, caller, and callee.
2. Record the approximate line range and exact minified symbol.
3. Assign a stable semantic alias, such as `session manager`, `local SessionFs provider`, or `SessionAgentExecutor`.
4. Follow the path outward through setup, entry points, runtime branching, event emission, persistence, cleanup, and SDK/API boundaries.
5. Triangulate with adjacent packaged files when the bundle is ambiguous.

## Anchor Format

Use a compact source-anchor table in docs and final reports.

| File | Approximate lines | Symbol or string | Semantic meaning |
|---|---:|---|---|
| `copilot-cli-pkg/app.js` | `~12345-12420` | `minifiedSymbol` | Runtime role confirmed by source reading |

## Interpretation Rules

- Approximate line numbers are enough because bundled output shifts between versions.
- Runtime source beats schema-only conclusions.
- Generated schemas describe contracts; they do not prove lifecycle or enforcement.
- Changed strings or symbol counts are leads, not proof of changed behavior.
- When confidence is low, record a candidate gap instead of writing authoritative prose.

## Pitfalls

- Broad bundle grep creates noise and wastes context.
- Declaration diffs are often noisy; prioritize string/API/event deltas first.
- Do not rename minified symbols in anchors; add semantic aliases alongside them.
- Do not infer product intent from minified branch structure unless behavior is directly observable.