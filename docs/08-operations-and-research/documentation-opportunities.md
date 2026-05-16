# Further documentation opportunities for Copilot CLI

This report summarizes a second-pass, script-assisted scan of the extracted Copilot CLI `app.js` bundle to identify areas that are still worth turning into focused implementation documents.

The current documentation set already covers the major runtime shape, prompts, memory/context board, compaction, loader/bootstrap, CLI routing, TUI, Tree-sitter, sessions, remote control, MCP, permissions, sandboxing, models/providers/auth, model API routing, resilience, task orchestration, autopilot, fleet mode, feature gates, and observability. The candidates below are therefore biased toward **implementation surfaces that are present in `app.js` but only partially covered or scattered across existing docs**.

## Source anchors

This report is a scan summary, so the semantic aliases are surface categories extracted from `app.js`. Minified anchors are representative strings used by the scan rather than full implementation names.

| Semantic alias | Minified anchor | Scan source | Role |
|---|---|---|---|
| Documentation scan | `/tmp/appjs_documentation_scan.json`, `/tmp/appjs_surface_summary.md` | temporary scan output | Original script-assisted inventory used to prioritize follow-up docs. |
| Slash command surface | `/plugin`, `/env`, `/every`, `/after`, `/research`, `/review`, `/skills`, `/subconscious` | `app.js` string scan | User-visible interactive command candidates. |
| CLI option surface | `--plugin-dir`, `--server`, `--headless`, `--allow-url`, `--deny-url` | `app.js` string scan | Root option candidates and cross-cutting behaviors. |
| Event schema surface | `tool.execution_*`, `session.*`, `permission.*`, `assistant.*` | `app.js` string scan | Event families used to identify lifecycle documents. |
| JSON-RPC surface | `session.*`, `sessionFs.*`, `mcp.config.*` | schema/string scan | Protocol/API candidates for SDK and server docs. |
| Environment surface | `COPILOT_*`, `GITHUB_*`, `GH_*` | `app.js` string scan | Configuration and operational environment candidates. |
| Feature gate surface | `SESSION_STORE`, `EXTENSIONS`, `VOICE`, `CONTENT_EXCLUSION`, `COLLECT_DEBUG_LOGS` | static feature table | Gate-driven implementation candidates. |

## Scan method

The scan used Python over `copilot-cli-pkg/app.js` and the then-existing flat `docs/*.md` files before this wiki reorganization.

Extracted surfaces:

| Surface | Count |
|---|---:|
| Bundle size | `11,865,712` bytes |
| Bundle lines | `8,684` lines |
| Existing Markdown docs scanned at that time | `25` |
| Slash commands extracted | `22` |
| CLI options extracted | `56` |
| Event type strings extracted | `104` |
| Related JSON-RPC method names extracted | `19` |
| Environment-variable-like strings extracted | `252` |
| Feature gate pairs extracted | `56` |

Temporary scan artifacts were generated outside the repository:

- `/tmp/appjs_documentation_scan.json`
- `/tmp/appjs_surface_summary.md`

Status update: the highest-priority, medium-priority, and later remaining gap-review topics identified from `app.js` have now been drafted and indexed.

Highest-priority set:

1. [`attachments-and-file-ingestion.md`](../02-context-and-input/attachments-and-file-ingestion.md)
2. [`plugin-extension-architecture.md`](../04-tools-and-integrations/plugin-extension-architecture.md)
3. [`built-in-tool-execution-pipeline.md`](../04-tools-and-integrations/built-in-tool-execution-pipeline.md)
4. [`hooks-lifecycle-automation.md`](../05-security-and-policy/hooks-lifecycle-automation.md)
5. [`ide-lsp-editor-integration.md`](../04-tools-and-integrations/ide-lsp-editor-integration.md)
6. [`git-repository-context.md`](../03-sessions-and-remote/git-repository-context.md)

Medium-priority set:

1. [`scheduled-prompts-and-command-queue.md`](../07-agents-and-automation/scheduled-prompts-and-command-queue.md)
2. [`settings-config-persistence.md`](../05-security-and-policy/settings-config-persistence.md)
3. [`system-events-and-ui-projection.md`](../03-sessions-and-remote/system-events-and-ui-projection.md)
4. [`web-search-url-fetching.md`](../04-tools-and-integrations/web-search-url-fetching.md)

Remaining gap-review set:

1. [`voice-mode-foundry-local.md`](../01-runtime-and-ui/voice-mode-foundry-local.md)
2. [`terminal-setup-and-shell-environment.md`](../01-runtime-and-ui/terminal-setup-and-shell-environment.md)
3. [`checkpoints-undo-rewind.md`](../02-context-and-input/checkpoints-undo-rewind.md)
4. [`usage-quota-billing-metrics.md`](../06-models-and-reliability/usage-quota-billing-metrics.md)
5. [`embedded-server-acp-protocol.md`](../01-runtime-and-ui/embedded-server-acp-protocol.md)
6. [`diagnostics-feedback-debug-bundles.md`](./diagnostics-feedback-debug-bundles.md)
7. [`custom-agents-and-skills-packaging.md`](../02-context-and-input/custom-agents-and-skills-packaging.md)
8. [`session-store-sqlite-indexing.md`](../03-sessions-and-remote/session-store-sqlite-indexing.md)
9. [`content-exclusion-and-redaction.md`](../05-security-and-policy/content-exclusion-and-redaction.md)

Additional iterative gap pass:

1. [`shell-command-execution-lifecycle.md`](../04-tools-and-integrations/shell-command-execution-lifecycle.md) now covers the previously scattered shell execution path: shell tool assembly, PTY vs process backends, sync/async/detached command handling, task tracking, background promotion, completion notifications, and large-output buffering.
2. A likely next high-value gap is the **runtime tool assembly and filtering path** that decides the final model-visible toolset across built-ins, MCP, extensions, custom agents, feature gates, focused-tools settings, and mode-specific exclusions.

## Extracted command surface

The script found these runtime slash commands:

| Slash command | Description from bundle |
|---|---|
| `/add-dir` | Add a directory to the allowed list for file access. |
| `/autopilot` | Toggle autopilot mode. |
| `/compact` | Summarize conversation history to reduce context window usage. |
| `/context` | Show context window token usage and visualization. |
| `/env` | Show loaded environment details: instructions, MCP servers, skills, agents, plugins, LSPs, extensions. |
| `/every` | Schedule a recurring prompt for this session. |
| `/after` | Schedule a one-shot prompt for this session. |
| `/fleet` | Enable fleet mode for parallel subagent execution. |
| `/init` | Initialize Copilot instructions for this repository. |
| `/list-dirs` | Display all allowed directories for file access. |
| `/mcp` | Manage MCP server configuration. |
| `/plan` | Create an implementation plan before coding. |
| `/plugin` | Manage plugins and plugin marketplaces. |
| `/rename` | Rename the current session. |
| `/research` | Run deep research investigation using GitHub search and web sources. |
| `/remote` | Show remote status or toggle remote control from GitHub web and mobile. |
| `/reset-allowed-tools` | Reset the list of allowed tools. |
| `/review` | Run code review agent to analyze changes. |
| `/sandbox` | Configure sandbox modes. |
| `/skills` | Manage skills for enhanced capabilities. |
| `/subconscious` | Manage Copilot Subconscious memory consolidation. |
| `/usage` | Display session usage metrics and statistics. |

The most interesting commands that do not yet have their own deep implementation documents are `/plugin`, `/env`, `/every`, `/after`, `/research`, `/review`, `/skills`, `/subconscious`, `/add-dir`, `/list-dirs`, and `/reset-allowed-tools`.

## Highest-value new documents

### 1. Attachment and file-ingestion pipeline

Implemented as: [`attachments-and-file-ingestion.md`](../02-context-and-input/attachments-and-file-ingestion.md)

Why it is worth documenting:

- The scan found strong implementation evidence around native attachments, MIME detection, inline documents, images, PDFs, request-size limits, and provider-specific payload mapping.
- Existing docs mention attachments, but mostly as prompt inputs or retry edge cases. There is no focused doc explaining how attachments become model input.

Useful anchors from `app.js`:

| Anchor / string | Inferred role |
|---|---|
| `input_file`, `input_image` | Provider payload mapping for document/image inputs. |
| `mimeType`, `base64Data`, `application/pdf`, `docx` | MIME/document detection and native payload construction. |
| `attached`, `attached-from-*` style strings | Attachment provenance/naming. |
| request-size error text around native CAPI Responses | Detects oversized native image/document requests and suggests smaller attachments. |
| `binary_attachments_removed` | Retry behavior when older binary attachments must be removed after request-size failures. |

Recommended outline:

1. Supported attachment classes: text files, selections, directories, images, PDFs, Office documents, GitHub/MCP file contents.
2. Attachment resolution: CLI prompt parsing, editor selection, file metadata, MIME detection, base64/native conversion.
3. Provider payload mapping: Chat Completions vs Responses vs Anthropic-style document/image content.
4. Limits and fallback behavior: max request size, native document fallback paths, binary attachment pruning on retry.
5. Security/permissions: file reads, URL reads, content exclusion, redaction.
6. User-visible failures and retry behavior.

### 2. Plugin and extension architecture

Implemented as: [`plugin-extension-architecture.md`](../04-tools-and-integrations/plugin-extension-architecture.md)

Why it is worth documenting:

- `copilot plugin --help` confirms plugins are a first-class feature that can contribute skills, agents, hooks, MCP servers, and LSP servers.
- Existing docs mention plugins/extensions in several places, but the actual install/cache/config/marketplace/extension lifecycle deserves its own implementation document.

Useful anchors from `app.js` and help output:

| Anchor / string | Inferred role |
|---|---|
| `installedPlugins`, `enabledPlugins` | User settings that persist installed and enabled plugin state. |
| `installed-plugins`, `plugin-data` | State directories for cached plugins and plugin-specific data. |
| `ET` plugin manager class | Installs, updates, uninstalls, saves config, counts plugin skills, finds plugin records. |
| `--plugin-dir <directory>` | Runtime local plugin injection. |
| `/plugin` and `copilot plugin` | Interactive and root CLI plugin management surfaces. |
| `setupExtensionsForSession`, `session.extensions_loaded`, `EXTENSIONS` | SDK extension loading and session tool registration. |
| `lspServers`, `language server` | Plugin-contributed LSP server support. |

Recommended outline:

1. Plugin sources: marketplaces, GitHub repos, subdirectories, direct git URLs, local `--plugin-dir`.
2. Install/update/uninstall flow and cache layout.
3. Plugin metadata: skills, custom agents, hooks, MCP servers, LSP servers.
4. Runtime merge into settings and session startup.
5. Extension loading, embedded server coupling, extension-provided tools, and permission scopes.
6. Feature gates and trust boundaries.

### 3. Built-in tool execution pipeline

Implemented as: [`built-in-tool-execution-pipeline.md`](../04-tools-and-integrations/built-in-tool-execution-pipeline.md)

Why it is worth documenting:

- There is extensive event and telemetry support for tool execution, but current docs mostly focus on permissions, MCP tools, or task orchestration rather than the full built-in tool lifecycle.
- This would explain how tools are exposed to models, executed, streamed, partially reported, approved, logged, retried, and represented in session history.

Useful anchors from `app.js`:

| Anchor / string | Inferred role |
|---|---|
| `tool.user_requested` | User-initiated tool invocation event. |
| `tool.execution_start` | Tool execution begins with tool call ID, name, arguments, and optional MCP metadata. |
| `tool.execution_partial_result` | Incremental/partial result streaming. |
| `tool.execution_progress` | Progress reporting. |
| `tool.execution_complete` | Completion event with success/error/result telemetry. |
| `str_replace_editor`, `apply_patch`, `edit`, `create`, `read_file`, `grep_search`, `bash` | Built-in editing/search/shell tools and compatibility names. |
| `preToolUse`, `postToolUse`, permission hooks | Tool lifecycle hook integration. |

Recommended outline:

1. Tool discovery/registration: built-ins, MCP tools, extension tools, custom tools.
2. Model-visible schema construction and filtering by mode/agent/flags.
3. Permission flow before execution.
4. Execution lifecycle events and session history representation.
5. Partial/progress results and UI rendering.
6. Editing tools, shell tools, search/read tools, and web/GitHub tools.
7. Telemetry, error classification, retry, cancellation, and persistence.

### 4. Hooks and lifecycle automation

Implemented as: [`hooks-lifecycle-automation.md`](../05-security-and-policy/hooks-lifecycle-automation.md)

Why it is worth documenting:

- Existing docs mention hooks in prompt/permission contexts, but `app.js` contains a complete hook schema, security policy, adapter layer, event stream, and lifecycle integration.
- Hooks are a cross-cutting extension point that affects prompts, permissions, tools, compaction, notifications, and shutdown.

Useful anchors from `app.js`:

| Anchor / string | Inferred role |
|---|---|
| `sessionStart`, `sessionEnd` | Session lifecycle hook points. |
| `userPromptSubmitted` | Prompt-submission hook. |
| `preToolUse`, `postToolUse`, `postToolUseFailure` | Tool lifecycle hooks. |
| `preCompact`, `postCompact` | Compaction hooks. |
| `permissionRequest`, `notification` | Authorization and notification hooks. |
| `hook.start`, `hook.end` | Session events emitted around hook execution. |
| `COPILOT_HOOK_ALLOW_LOCALHOST`, `COPILOT_HOOK_ALLOW_HTTP_AUTH_HOOKS` | Security overrides for local/HTTP hook development. |
| `.github/hooks` | Repository hook discovery path. |

Recommended outline:

1. Hook schema and VS Code compatibility aliases.
2. Hook discovery: repo hooks, plugins, runtime options.
3. Command vs HTTP hooks, environment and stdin payloads.
4. Authorization-sensitive hook restrictions and HTTPS requirements.
5. How hook outputs can approve/deny/modify tool calls or add prompt context.
6. Hook events, telemetry, failure handling, and user-facing messages.
7. Interactions with permissions, compaction, and session shutdown.

### 5. IDE, LSP, and editor bridge

Implemented as: [`ide-lsp-editor-integration.md`](../04-tools-and-integrations/ide-lsp-editor-integration.md)

Why it is worth documenting:

- The scan shows dedicated IDE tools, editor diff integration, diagnostics, selections, LSP config, plugin-contributed LSP servers, and embedded-server coupling.
- Current docs mention IDE/extensions at a high level but do not deeply explain how editor state flows into the CLI.

Useful anchors from `app.js`:

| Anchor / string | Inferred role |
|---|---|
| `ide` config block with `autoConnect`, `openDiffOnEdit` | Runtime IDE integration settings. |
| `get_diagnostics`, `get_selection`, `open_diff` | IDE tool names. |
| `callIdeTool(...)` | Session-side bridge to IDE tools. |
| `isConnectedToIde`, `updateSessionName` | IDE connection/session sync. |
| `language server`, `lspServers`, LSP config parser | Plugin LSP support. |
| `session.extensions_loaded` | Extension state exposed to the session/UI. |

Recommended outline:

1. IDE auto-connect and embedded server registration.
2. Editor selection and diagnostics as context/tool data.
3. Open-diff-on-edit workflow.
4. LSP server discovery from plugins and configuration.
5. Extension tools and permission boundaries.
6. Failure modes when the CLI is not connected to an IDE.

### 6. Git, repository, PR, and ref context

Implemented as: [`git-repository-context.md`](../03-sessions-and-remote/git-repository-context.md)

Why it is worth documenting:

- Git/repository context appears in session selection, remote export, MCP GitHub tooling, content exclusion, checkpoints, telemetry, and session-store refs.
- Existing docs mention repository context in many places, but a focused implementation doc would clarify how the CLI derives and reuses it.

Useful anchors from `app.js`:

| Anchor / string | Inferred role |
|---|---|
| `gitRoot`, `headCommit`, `baseCommit` | Working directory context fields. |
| `rev-parse`, `git status --porcelain`, `hash-object` | Git shell commands used for context/diff/file identity. |
| `repository`, `host_type`, `branch` | Session/workspace metadata. |
| `pullRequestNumber` | Remote/cloud task metadata. |
| `session_refs` | SQLite/session-store refs for PRs/issues/commits. |
| `github-mcp-server-*` | GitHub MCP tools that enrich repository/PR context. |
| `CHILD_GIT_REPO_SCAN` | Feature gate for deeper repo scanning in child contexts. |

Recommended outline:

1. Working directory and git-root discovery.
2. Repository/branch/commit metadata extraction.
3. How context is written into `session.start`, `session.resume`, `workspace.yaml`, and telemetry.
4. How repo context influences `--continue`, session ranking, remote export, and cloud indexing.
5. PR/issue/commit ref extraction into `session_refs`.
6. GitHub MCP overlap and fallback behavior.

## Medium-priority candidates

### 7. Scheduled prompts and queued commands

Implemented as: [`scheduled-prompts-and-command-queue.md`](../07-agents-and-automation/scheduled-prompts-and-command-queue.md)

Why it is worth documenting:

- `/every` and `/after` are user-visible and backed by `ScheduleRegistry`.
- Event strings include `session.schedule_created`, `session.schedule_cancelled`, `command.queued`, `command.execute`, and `command.completed`.
- Existing docs discuss queues in other contexts but do not explain scheduled prompts as a feature.

Recommended outline:

1. `/every` and `/after` parsing and interval validation.
2. `ScheduleRegistry` lifecycle and disposal on `session.shutdown`.
3. Recurring vs one-shot entries.
4. Queue integration and emitted command/session events.
5. Restrictions: scheduled slash commands are rejected; only plain messages are scheduled.
6. Interaction with autopilot/background modes.

### 8. Configuration and settings persistence

Implemented as: [`settings-config-persistence.md`](../05-security-and-policy/settings-config-persistence.md)

Why it is worth documenting:

- Configuration is currently covered only as part of integration/permission docs.
- `app.js` has many settings stores and `writeKey`/`load` paths for plugins, permissions, sandboxing, MCP, feature flags, model/provider settings, init suppression, and terminal prompts.

Recommended outline:

1. Settings roots and `configDir` behavior.
2. User settings vs runtime settings vs workspace config.
3. `load`, `write`, and `writeKey` helpers.
4. Feature flags and settings override precedence.
5. Permission, MCP, plugin, sandbox, model/provider, and UI setting persistence.
6. Trust and path normalization behavior.

### 9. System notifications and event-to-UI projection

Implemented as: [`system-events-and-ui-projection.md`](../03-sessions-and-remote/system-events-and-ui-projection.md)

Why it is worth documenting:

- Session history has many events that are not visible one-to-one in the UI.
- `system.notification`, `system.message`, `session.info`, `session.warning`, and display conversion code explain why some runtime events become chat-like messages while others are ignored.

Recommended outline:

1. Event schema vs UI timeline entries.
2. `system.message` as model-visible system/developer context.
3. `system.notification` as user-message-like runtime context except for filtered instruction-discovery cases.
4. `session.info` / `session.warning` display and telemetry.
5. Which events are suppressed in ACP/TUI/headless output.

### 10. Web search, URL fetching, and URL permissions

Implemented as: [`web-search-url-fetching.md`](../04-tools-and-integrations/web-search-url-fetching.md)

Why it is worth documenting:

- The bundle includes `web_search`, GitHub MCP web-search compatibility, URL permission handling, and extensive fetch/browser infrastructure.
- Existing permission docs explain URL allow/deny policy, but not the end-to-end web-search/fetch capability path.

Recommended outline:

1. Built-in web tools vs GitHub MCP `web_search` compatibility shim.
2. URL allow/deny rules and prompt surfaces.
3. Fetch/browser transport stack and proxy/env behavior.
4. Tool output shaping and model-visible results.
5. Feature gates such as `DISABLE_WEB_TOOLS` and related provider/model capability switches.

## Later gap-review topics now implemented

After the high- and medium-priority batches, a final gap scan found several important but more specialized implementation surfaces. They are now covered as focused docs:

| Topic | Implemented as |
|---|---|
| Voice mode / Foundry Local | [`voice-mode-foundry-local.md`](../01-runtime-and-ui/voice-mode-foundry-local.md) |
| Terminal setup and shell environment | [`terminal-setup-and-shell-environment.md`](../01-runtime-and-ui/terminal-setup-and-shell-environment.md) |
| Checkpoints, undo, rewind, and fork | [`checkpoints-undo-rewind.md`](../02-context-and-input/checkpoints-undo-rewind.md) |
| Usage, quota, and billing metrics | [`usage-quota-billing-metrics.md`](../06-models-and-reliability/usage-quota-billing-metrics.md) |
| Embedded server / ACP / JSON-RPC protocol | [`embedded-server-acp-protocol.md`](../01-runtime-and-ui/embedded-server-acp-protocol.md) |
| Diagnostics, feedback, and debug bundles | [`diagnostics-feedback-debug-bundles.md`](./diagnostics-feedback-debug-bundles.md) |
| Custom agents and skills packaging | [`custom-agents-and-skills-packaging.md`](../02-context-and-input/custom-agents-and-skills-packaging.md) |
| Session-store SQLite indexing | [`session-store-sqlite-indexing.md`](../03-sessions-and-remote/session-store-sqlite-indexing.md) |
| Content exclusion and redaction | [`content-exclusion-and-redaction.md`](../05-security-and-policy/content-exclusion-and-redaction.md) |

## Lower priority or already covered

| Topic | Current coverage |
|---|---|
| Cloud sandbox/detached execution | Covered by `sandboxing.md`, `sessions-remote-cloud.md`, `remote-control-implementation.md`, and `memory-and-context-board.md`; a new doc is only warranted for a very narrow detached-child/rem-agent deep dive. |
| Model routing/streaming details | Covered by `model-api-routing.md` and `resilience-rate-limits-concurrency.md`. |
| MCP OAuth/tasks/tools | Covered by `mcp-support-implementation.md`. |
| Session persistence/handoff | Covered by `session-support-implementation.md` and `session-store-sqlite-indexing.md`. |
| Remote Mission Control export/control | Covered by `remote-control-implementation.md` and `sessions-remote-cloud.md`. |

## Recommended next writing order

The current important `app.js` documentation backlog is now covered by focused docs and indexed in `README.md`. Future writing should be driven by new questions rather than by the existing gap list. Possible niche follow-ups, only if needed, are:

1. A very focused cloud-sandbox/detached-child/rem-agent execution deep dive.
2. A TUI rendering/theme/Tuikit internals document if terminal rendering itself becomes the research target.
3. A package/native-dependency inventory document if binary packaging and vendored native modules need a broader audit beyond the loader and voice-mode docs.
