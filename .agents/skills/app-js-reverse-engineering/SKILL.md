---
name: app-js-reverse-engineering
description: 'Use when reverse-engineering copilot-cli-pkg/app.js, bundled or minified coding-agent runtime call paths, source anchors, documentation gaps, docs updates, call-path diagrams, or Copilot CLI internals analysis.'
argument-hint: '[target call path, suspected gap, or doc area]'
user-invocable: true
---

# App.js Reverse Engineering Documentation Workflow

## What This Skill Produces

Use this skill to iteratively reverse-engineer `copilot-cli-pkg/app.js` and turn confirmed runtime behavior into source-anchored documentation. The expected output is one or more of:

- a gap assessment that explains which major call paths are already documented and which are missing;
- a new or updated Markdown doc under `docs/` with source anchors, minified aliases, semantic names, call-path tables, and diagrams;
- updated navigation, indexes, page counts, and backlog notes;
- a validation summary showing that the documentation site still builds.

Default project paths for this repository:

- Bundle under analysis: `copilot-cli-pkg/app.js`
- Generated/test package bundle: `artifacts/copilot-cli-pkg-test/app.js`
- Documentation root: `docs/`
- Website validation directory: `website/`

## When to Use

Use this skill when the user asks to:

- reverse-engineer `app.js` or the Copilot CLI/coding-agent runtime;
- identify major call paths that are not covered by current docs;
- continue an iterative gap-filling pass across `app.js`;
- document a runtime subsystem such as tools, sessions, permissions, model routing, validation, shell execution, subagents, MCP, SessionFs, or task orchestration;
- compare current docs against bundled/minified source behavior;
- preserve exact source anchors and minified symbol names for future archaeology.

Do not use this skill for ordinary feature implementation, generic docs cleanup, or broad code review unrelated to the bundled runtime.

## Core Principles

1. **Start from current docs, not from a blank page.** Always inspect existing docs and indexes before deciding that a gap exists.
2. **Search narrowly.** `app.js` is bundled/minified; broad searches create noisy results. Use targeted semantic terms and known aliases.
3. **Anchor every claim.** Important behavioral claims need a source anchor: file path, approximate line range, symbol/minified alias, and semantic interpretation.
4. **Prefer confirmed gaps.** If a path is already documented, improve cross-links or add a small note instead of creating duplicate pages.
5. **Separate signal from speculation.** Document only behavior confirmed by source reads; keep uncertain findings in a candidate-gap note.
6. **Validate docs after edits.** Build the website and check Git status before reporting completion.

## Procedure

### 1. Understand the Requested Slice

Identify the target subsystem, for example:

- model/provider routing;
- request resilience, rate limits, and concurrency;
- tool registration, filtering, and execution lifecycle;
- shell command execution;
- permissions and approval flows;
- sessions, remote APIs, JSON-RPC, SessionFs, or session-state files;
- tasks, subagents, autopilot, and completion criteria;
- observability, updates, shutdown, or telemetry.

If the user did not specify a subsystem, choose a likely high-value gap by reviewing the existing backlog and docs indexes.

### 2. Audit Existing Documentation

Read the relevant section index and likely target docs before touching `app.js`:

- `docs/README.md`
- `docs/SUMMARY.md`
- section `README.md` files under `docs/*/`
- `docs/08-operations-and-research/documentation-opportunities.md`
- any existing page matching the subsystem keywords

Classify the target as one of:

| Classification | Action |
|---|---|
| Already deeply covered | Do not create a duplicate page; optionally add a cross-link or note. |
| Partially covered | Extend the existing page or create a focused companion page. |
| Mentioned only by schema/index | Create a new call-path page if source confirms runtime behavior. |
| Not covered | Create a new focused page after source confirmation. |

### 3. Build a Source Anchor Plan

Create a short search plan before querying the bundle:

- semantic subsystem words, such as `sessionFs`, `initializeAndValidateTools`, `getCompletionWithTools`, `permission`, `task`, `shell`, `mcp`;
- generated/API names from SDK files or schemas;
- already-known minified aliases from existing docs;
- event names and JSON-RPC method names;
- adjacent terms that should co-occur in the same call path.

Use alternation-style searches to collect a map of likely anchors in one pass. Avoid repeatedly scanning all of `app.js` with vague words such as `run`, `tool`, `session`, or `agent` unless they are paired with specific aliases or method names.

### 4. Read Focused Source Ranges

For each promising anchor:

1. Read enough surrounding source to understand the enclosing function/class, caller, callee, and data structures.
2. Record the approximate line range and the minified symbol.
3. Assign a semantic alias, for example `P6 = session manager`, `VC = local SessionFs`, or `dZ = SessionAgentExecutor`.
4. Follow the path outward:
   - constructors and factory setup;
   - request/session entry points;
   - runtime filtering or branching;
   - event emission;
   - persistence or cleanup;
   - SDK/API/schema surfaces.

If one source range is unclear, triangulate with related files such as:

- `copilot-cli-pkg/copilot-sdk/index.js`
- `copilot-cli-pkg/copilot-sdk/*.d.ts`
- `copilot-cli-pkg/schemas/`
- `copilot-cli-pkg/definitions/`
- `help/*.txt`

### 5. Reconstruct the Call Path

Convert the source reads into a concise runtime map:

- entry point or trigger;
- main runtime object/function;
- branch conditions and decision points;
- downstream calls;
- events emitted or persisted;
- SDK/API boundary;
- error handling and cleanup;
- relationship to user-visible behavior.

Prefer a table like this:

| Step | Runtime anchor | What happens | Documentation implication |
|---|---|---|---|
| 1 | `symbol` at `app.js` ~line | Behavior | Why it matters |

Add a small Mermaid diagram only when it clarifies the flow.

### 6. Decide the Documentation Change

Use this branching logic:

- **Existing page has the right scope:** patch that page.
- **Existing page is broad and the path is complex:** create a focused companion page and link both ways.
- **Only an API/schema list exists:** create a runtime lifecycle page that explains how the schema is used.
- **Backlog already lists the gap:** mark it closed or narrow the remaining gap.
- **Evidence is weak:** do not create a full page; add a candidate note only if useful.

Choose the docs section by subsystem:

- tools/MCP/shell/validation: `docs/04-tools-and-integrations/`
- sessions/remote/SDK/JSON-RPC/SessionFs: `docs/03-sessions-and-remote/`
- permissions/security/policy: `docs/05-security-and-policy/`
- models/reliability/providers: `docs/06-models-and-reliability/`
- agents/tasks/subagents/autopilot: `docs/07-agents-and-automation/`
- observability/updates/research backlog: `docs/08-operations-and-research/`

### 7. Write Source-Anchored Docs

Each new or materially updated page should include:

- purpose and scope;
- source anchor table with file, approximate line, symbol, and semantic meaning;
- reconstructed call path;
- key data structures or event names;
- user-visible behavior or operational implications;
- edge cases, cleanup, or failure modes;
- related docs and residual gaps.

Use careful language for minified code:

- say “approximately” for line numbers;
- preserve exact minified aliases;
- distinguish generated schemas from runtime implementation;
- avoid overclaiming intent when only behavior is visible.

### 8. Update Navigation and Backlog

After adding or moving a page, update all relevant indexes:

- nearest section `README.md`;
- `docs/SUMMARY.md`;
- `docs/README.md` page list and page count if it tracks one;
- root `README.md` if it tracks docs counts;
- `docs/08-operations-and-research/documentation-opportunities.md` if the work closes or narrows a known gap.

Also add cross-links from adjacent pages so readers can discover the new path from related concepts.

### 9. Validate

Run the docs build from the repository root context:

```sh
cd website
npm run build
```

If terminal state may be unknown, use an absolute repository path before changing into `website/`. In zsh, avoid assigning to the readonly variable `status`; use a variable such as `rc` instead.

Then verify:

- Markdown page count is expected;
- build completes successfully;
- warnings are understood and unrelated;
- Git status contains only intended docs/skill changes;
- new files are accounted for, including untracked files that `git diff --stat` omits.

### 10. Report Completion

Summarize in the user’s language:

- which call path or gap was analyzed;
- files created or changed;
- key source anchors used;
- validation result;
- remaining candidate gaps, if any.

Keep the summary concise; do not paste large docs content unless the user asks.

## Quality Checklist

Before marking the work complete, confirm:

- [ ] Existing docs were checked first.
- [ ] At least one source anchor directly supports each major claim.
- [ ] Minified aliases and semantic names are both recorded.
- [ ] Duplicate documentation was avoided.
- [ ] New pages are linked from the appropriate index and summary files.
- [ ] Backlog/counts were updated when applicable.
- [ ] Website build succeeded or any failure is explained with next steps.
- [ ] Final summary includes files changed and validation status.

## Common Pitfalls

- **Broad bundle grep:** noisy and slow; search for specific aliases, API names, and event names instead.
- **Schema-only conclusions:** schemas show contracts, not runtime lifecycle. Confirm implementation in `app.js` or SDK code.
- **Line-number overprecision:** bundled output shifts; use approximate lines plus symbol names.
- **Doc duplication:** if a topic already has a page, extend or cross-link instead of creating parallel explanations.
- **Untracked file blindness:** `git diff --stat` does not include new untracked pages; check status explicitly.
- **Terminal directory drift:** previous terminal commands may leave the shell inside `website/`; use absolute paths when validating.

## Example Prompts

- `/app-js-reverse-engineering 继续找出 app.js 中还没被 docs 覆盖的主要调用路径，并补全文档`
- `/app-js-reverse-engineering 分析 SessionFs 的 provider、JSON-RPC reverse call 和 session-state 文件生命周期`
- `/app-js-reverse-engineering 审计工具注册、过滤、执行事件链路是否已经被文档覆盖`
- `/app-js-reverse-engineering 基于 app.js 重新检查 task/subagent/autopilot 的调用路径 gap`