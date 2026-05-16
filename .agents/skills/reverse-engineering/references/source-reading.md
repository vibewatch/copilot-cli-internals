# Source Reading and Anchor Handling

Use this reference for precise searches, source anchors, semantic aliasing, and minified-code interpretation.

## Build a Narrow Anchor Plan

Prefer specific terms that should co-occur in the target path:

- Semantic subsystem words such as `sessionFs`, `initializeAndValidateTools`, `getCompletionWithTools`, `permission`, `task`, `shell`, or `mcp`.
- Generated API names from SDK files or schemas.
- Known minified aliases from existing docs or previous source reads.
- Event names, JSON-RPC-ish methods, slash commands, environment variables, and feature keys.
- Adjacent concepts that should appear in the same call path.

In incremental mode, seed the plan from `source-atlas/` diffs first: changed events, env vars, command candidates, JSON-RPC-ish methods, feature gates, tool hits, packaged definitions, and moved semantic anchors.

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