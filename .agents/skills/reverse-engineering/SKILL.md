---
name: reverse-engineering
description: 'Use when reverse-engineering copilot-cli-pkg/app.js or adjacent Copilot CLI runtime artifacts, source-atlas diffs, full or incremental bundled/minified coding-agent analysis, source anchors, documentation gaps, docs updates, call-path diagrams, or package-version deltas.'
argument-hint: '[mode: full|incremental; target call path, source-atlas diff, docs gap, or package delta]'
user-invocable: true
---

# Reverse Engineering

## Purpose

Use this skill to reverse-engineer the extracted Copilot CLI runtime and turn confirmed behavior into source-anchored documentation. The workflow supports both broad reconstruction and package-update diff analysis.

This skill is the operational source of truth for generating repository documentation. `WORKFLOW.md` can remain as a human-readable overview, but an agent should not need to read it before producing or updating docs; load the references below as needed instead.

## What This Skill Produces

- A gap assessment that explains which major runtime paths are already documented and which are missing.
- A full analysis pass that reconstructs a subsystem from `copilot-cli-pkg/app.js`, adjacent SDK/schema/help files, and current docs.
- An incremental analysis pass that starts from `source-atlas/` diffs and focuses only on changed runtime surfaces.
- New or updated Markdown docs under `docs/` with source anchors, minified aliases, semantic names, call-path tables, and diagrams when useful.
- Updated navigation, indexes, page counts, backlog notes, and a validation summary.

## Repository Map

- Runtime bundle: `copilot-cli-pkg/app.js`
- Source atlas generator: `scripts/index-app-js.mjs`
- Source atlas baseline: `source-atlas/`
- Optional temporary comparison atlas: `source-atlas-next/`
- Generated or test package bundle: `artifacts/copilot-cli-pkg-test/app.js`
- Documentation root: `docs/`
- Website validation directory: `website/`

## Choose a Mode

| Mode | Use when | Primary inputs | Primary output |
|---|---|---|---|
| Full analysis | The request asks for a new subsystem map, broad gap-finding, first-time documentation, or a topic with no obvious atlas delta. | `copilot-cli-pkg/app.js`, existing docs, SDK/schema/help files, targeted searches, optional `source-atlas/` anchors. | Reconstructed call path, confirmed source anchors, and new or updated docs. |
| Incremental analysis | The request asks what changed after a package update, mentions diff/comparison/regression, or wants docs updated from a new `app.js`. | Committed `source-atlas/` baseline, regenerated atlas output, Git diffs, and focused source reads around changed surfaces. | Change triage, affected docs list, targeted source reads, and minimal docs/source-atlas updates. |

Selection rules:

- If the user explicitly asks for full analysis, broad reconstruction, new subsystem mapping, or gap discovery, use full analysis.
- If the user explicitly asks for incremental analysis, package-update comparison, regressions, diffs, or `source-atlas/` changes, use incremental analysis.
- If the task follows a package extraction or bundle update and the user does not specify a mode, prefer incremental analysis.
- If `source-atlas/` is missing or cannot serve as a previous baseline, explain the limitation and fall back to full analysis unless Git history provides a usable baseline.

## Progressive References

Load only the reference files needed for the selected task:

- Full subsystem reconstruction: [`./references/full-analysis.md`](./references/full-analysis.md)
- Incremental atlas-diff triage: [`./references/incremental-analysis.md`](./references/incremental-analysis.md)
- Source search and anchor handling: [`./references/source-reading.md`](./references/source-reading.md)
- Documentation writing and navigation updates: [`./references/docs-writing.md`](./references/docs-writing.md)
- Validation, reporting, and quality gates: [`./references/validation.md`](./references/validation.md)

## Quick Procedure

1. Identify the requested subsystem or package delta and choose full or incremental mode.
2. Review existing docs and indexes before reading the bundled source.
3. Inspect the relevant source-material trust model before deciding what counts as proof.
4. Prepare or inspect `source-atlas/` when it helps discovery or diff triage.
5. Build a narrow source-anchor plan using semantic names, minified aliases, events, API names, and atlas surfaces.
6. Read focused source ranges in `app.js` and adjacent SDK/schema/help files until the behavior is confirmed.
7. Reconstruct either the runtime call path or the incremental change map.
8. Patch existing docs or create focused new pages, then update navigation, website sidebar, atlas references, and backlog files as needed.
9. Validate the changed artifacts and report the selected mode, source anchors, files changed, and remaining gaps.

## Operating Principles

- Start from current docs, not from a blank page.
- Search narrowly; broad bundle searches are noisy against minified output.
- Treat `source-atlas/` as a triage layer, not behavioral proof.
- Anchor every major claim with file path, approximate line range, symbol or minified alias, and semantic interpretation.
- Preserve both exact minified aliases and stable semantic names.
- Prefer extending or cross-linking existing docs over creating duplicates.
- In incremental mode, prioritize changed strings, events, API surfaces, commands, and feature gates before raw declaration-count changes.
- Use careful language for minified code and avoid overclaiming intent.
- Keep public internals docs focused on runtime behavior; do not expose planning-stage or project-management terminology.
- Do not edit extracted package artifacts unless the user explicitly asks for package-file changes.

## Completion Gate

Before finishing, confirm that:

- The mode was selected and reported.
- Existing docs were checked first.
- Each major claim has a direct source anchor.
- `source-atlas/` was regenerated, compared, or intentionally left untouched, and that choice is reported.
- New or moved docs are linked from the appropriate indexes and summary files.
- Validation succeeded, or any failure is explained with next steps.
- Git status contains only intended changes.

## Example Prompts

- `/reverse-engineering full analysis of runtime tool assembly and filtering`
- `/reverse-engineering full analysis of SessionFs provider, JSON-RPC reverse calls, and session-state file lifecycle`
- `/reverse-engineering incremental package update: use source-atlas diff to find new commands, events, and docs changes`
- `/reverse-engineering compare the new bundle against source-atlas and identify docs-relevant runtime deltas`
- `/reverse-engineering audit whether tool registration, filtering, and execution events are already documented`
- `/reverse-engineering map remaining gaps for task, subagent, and autopilot paths`