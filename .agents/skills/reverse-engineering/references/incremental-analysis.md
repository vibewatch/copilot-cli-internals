# Incremental Analysis Mode

Use incremental analysis after a package or bundle update. This mode treats the committed `source-atlas/` directory as the baseline, regenerates or compares atlas output, and then reads only source ranges that correspond to docs-relevant deltas.

## Baseline Rules

1. Check Git status before regenerating anything so you know whether `source-atlas/` is clean, modified, or untracked.
2. If the bundle has been updated and `source-atlas/` is clean, run `node scripts/index-app-js.mjs` to regenerate the baseline in place, then inspect `git diff -- source-atlas`.
3. If you need a non-destructive comparison, run `node scripts/index-app-js.mjs --out source-atlas-next`, compare `source-atlas/` with `source-atlas-next/`, and remove or explicitly report the temporary directory when done.
4. If no previous atlas baseline exists, explain that incremental comparison is limited and fall back to full analysis for behavior reconstruction.

## Diff Reading Order

Read atlas diffs in this order:

1. `source-atlas/summary.json` for source hash, line/byte count, and aggregate surface count changes.
2. `source-atlas/surface-index.json` and `source-atlas/constants.md` for env vars, events, slash commands, JSON-RPC-ish methods, tool-name hits, feature keys, experiment flags, and packaged definitions.
3. `source-atlas/README.md` for main path seed or semantic anchor movement.
4. `source-atlas/declarations.json` only for specific symbol/class/declaration movement or large count anomalies.

## Delta Triage

Classify each meaningful delta before reading deep source ranges.

| Delta type | Initial action |
|---|---|
| User-visible command | Confirm parser/dispatcher behavior in `app.js` and update CLI/TUI docs if needed. |
| Event, schema, or API boundary | Confirm emission/consumption path and update session/API docs if behavior changed. |
| Feature gate or config key | Confirm gating logic and update operations/security/model docs if user-visible. |
| Tool/runtime path | Confirm registration/filtering/execution path and update tool docs if needed. |
| Integration, extension, or MCP surface | Confirm runtime lifecycle and update integration docs if needed. |
| Permission or security surface | Confirm enforcement path before documenting security implications. |
| Observability or operations surface | Confirm log/diagnostic/update/shutdown behavior and update operations docs. |
| Raw declaration-count movement | Treat as low-priority noise unless tied to a named anchor or changed surface string. |

## Focused Source Reads

- Seed searches from changed strings, event names, commands, JSON-RPC-ish methods, feature gates, or tool hits.
- Read `app.js` only around deltas that may affect behavior or docs.
- Do not re-read unrelated subsystems just because `declarations.json` count totals changed.
- Confirm behavior in `app.js` or adjacent SDK/schema/help files before updating docs.

## Incremental Change Map Template

| Delta | Atlas/source anchor | Interpretation | Documentation action |
|---|---|---|---|
| New or changed surface | `source-atlas/surface-index.json`; `app.js` around an approximate line | Confirmed behavior or rejected false positive | Patch, create, cross-link, or ignore with reason |

## Baseline Handling

- Keep regenerated `source-atlas/` changes when they represent the new package baseline.
- Do not keep `source-atlas-next/` unless the user explicitly asks to preserve it.
- In the final report, distinguish generated atlas changes from hand-written documentation changes.
- Never claim behavior changed from atlas diffs alone; atlas output points to where source reading should happen.