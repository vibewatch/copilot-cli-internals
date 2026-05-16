# Documentation Writing and Navigation

Use this reference when deciding whether to create, patch, cross-link, or defer documentation.

## Audit Existing Docs First

Read the relevant indexes and candidate pages before creating new docs:

- `docs/README.md`
- `docs/SUMMARY.md`
- Section `README.md` files under `docs/*/`
- `docs/08-operations-and-research/documentation-opportunities.md`
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

- Tools, MCP, shell, validation: `docs/04-tools-and-integrations/`
- Sessions, remote, SDK, JSON-RPC, SessionFs: `docs/03-sessions-and-remote/`
- Permissions, security, policy: `docs/05-security-and-policy/`
- Models, reliability, providers: `docs/06-models-and-reliability/`
- Agents, tasks, subagents, autopilot: `docs/07-agents-and-automation/`
- Observability, updates, source atlas, research backlog: `docs/08-operations-and-research/`

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
- `docs/08-operations-and-research/documentation-opportunities.md` when the work closes or narrows a known gap.

Also add cross-links from adjacent pages so readers can discover the path from related concepts.

## Writing Style

- Use English prose in skill resources and repository docs unless a target doc intentionally uses another language.
- Say “approximately” for bundle line numbers.
- Preserve exact minified aliases and string literals.
- Distinguish generated schemas from runtime implementation.
- Avoid overclaiming intent when only behavior is visible.