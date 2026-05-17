# Documentation Writing and Navigation

Use this reference when deciding whether to create, patch, cross-link, or defer documentation.

## Audit Existing Docs First

Read the relevant indexes and candidate pages before creating new docs:

- `docs/README.md`
- `docs/SUMMARY.md`
- Section `README.md` files under `docs/*/`
- `docs/99-research-atlas/documentation-opportunities.md`
- Existing pages matching subsystem keywords

Classify the target before editing.

| Classification | Action |
|---|---|
| Already deeply covered | Do not create a duplicate page; optionally add a cross-link or small source-anchor update. |
| Partially covered | Extend the existing page or create a focused companion page. |
| Mentioned only by schema or index | Create a runtime lifecycle page if source confirms behavior. |
| Not covered | Create a focused page after source confirmation. |

In incremental mode, classify each changed atlas surface as already documented, stale existing doc, new runtime surface, or scan noise.

## Choose the Docs Section

- Start/orientation and feature map: `docs/00-start-here/`
- Runtime startup, UI modes, protocols, voice, rendering, and shutdown entry points: `docs/01-runtime-lifecycle/`
- Prompt/context assembly, attachments, memory, compaction, model providers, retries, quota, and usage: `docs/02-context-model-loop/`
- Tools, MCP, plugins, SDK/IDE/web integrations, permissions, redaction, hooks, sandboxing, and config policy: `docs/03-tools-integrations-security/`
- Sessions, remote, SDK/JSON-RPC, SessionFs, event schemas, indexing, git/repo context, and remote control: `docs/04-sessions-persistence-remote/`
- Hosted-agent environment, feature gates, diagnostics, debug bundles, OTel, trajectory/firewall output, and operational support: `docs/05-hosted-agent-ops/`
- Agents, tasks, custom agents/skills, subagents, autopilot, fleet, and scheduled prompts: `docs/06-agents-automation/`
- Generated source atlas, documentation opportunities, methodology, and future watchpoints: `docs/99-research-atlas/`

## Decide the Documentation Change

- Patch an existing page when it already has the right scope.
- Create a focused companion page when the path is complex and the existing page is broad.
- Create a runtime lifecycle page when only API/schema listings exist.
- Mark backlog items closed or narrow remaining gaps when the work resolves a known gap.
- If evidence is weak, avoid a full page and record only a candidate note when useful.
- In incremental mode, prefer minimal patches over new pages unless the delta exposes a genuinely new lifecycle or subsystem.

## Page Contents

Each new or materially updated page should include:

- Purpose and scope.
- Source anchor table with file, approximate line, symbol, and semantic meaning.
- Reconstructed call path or change map.
- Key data structures, event names, commands, feature gates, or API boundaries.
- User-visible behavior or operational implications.
- Edge cases, cleanup, failure modes, and caveats.
- Related docs and residual gaps.

## Navigation and Backlog Updates

After adding or moving a page, update all relevant indexes:

- Nearest section `README.md`.
- `docs/SUMMARY.md`.
- `docs/README.md` page list and page count if it tracks one.
- Root `README.md` if it tracks docs counts.
- `website/astro.config.mjs` sidebar when the page should be reachable from the website navigation.
- `scripts/index-app-js.mjs` known anchors or documentation references when atlas output should point at renamed or newly canonical pages.
- Regenerated `source-atlas/` output when atlas references or known doc links change.
- `docs/99-research-atlas/documentation-opportunities.md` when the work closes or narrows a known gap.

Also add cross-links from adjacent pages so readers can discover the path from related concepts.

## Writing Style

- Use English prose in skill resources and repository docs unless a target doc intentionally uses another language.
- Say “approximately” for bundle line numbers.
- Preserve exact minified aliases and string literals.
- Distinguish generated schemas from runtime implementation.
- Avoid overclaiming intent when only behavior is visible.
- Avoid project-process language in published internals docs. Prefer reader-facing terms such as “runtime boundary,” “source anchors,” “call path,” “confirmed behavior,” “candidate gap,” and “research note.”
- Pair physical reorganization with content work: after renames or moves, revise scope statements, handoff links, and reader contracts instead of only changing paths.
- Keep raw atlas findings, weak constants-only leads, and binary-only notes in `docs/99-research-atlas/` until source-confirmed.