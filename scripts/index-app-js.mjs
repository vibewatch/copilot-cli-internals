#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_APP_JS = join(REPO_ROOT, "copilot-cli-pkg", "app.js");
const DEFAULT_OUT_DIR = join(REPO_ROOT, "source-atlas");
const DEFAULT_MARKDOWN_LIMIT = 250;

const EVENT_PREFIXES = [
  "agent",
  "assistant",
  "hook",
  "permission",
  "session",
  "subagent",
  "tool",
  "workspace",
];

const RPC_PREFIXES = [
  "backgroundSession",
  "extensions",
  "fs",
  "mcp.config",
  "mcp.server",
  "session",
  "sessionFs",
  "tasks",
  "tools",
];

const CONFIRMED_SLASH_COMMANDS = [
  "/add-dir",
  "/after",
  "/autopilot",
  "/compact",
  "/context",
  "/env",
  "/every",
  "/fleet",
  "/init",
  "/list-dirs",
  "/mcp",
  "/plan",
  "/plugin",
  "/rename",
  "/research",
  "/remote",
  "/reset-allowed-tools",
  "/review",
  "/sandbox",
  "/skills",
  "/subconscious",
  "/usage",
];

const KNOWN_TOOL_NAMES = [
  "apply_patch",
  "ask_user",
  "bash",
  "code_review",
  "context_board",
  "create",
  "edit",
  "glob",
  "grep",
  "grep_search",
  "lsp",
  "parallel_validation",
  "powershell",
  "read_agent",
  "read_file",
  "report_intent",
  "skill",
  "str_replace_editor",
  "task",
  "task_complete",
  "think",
  "view",
  "web_fetch",
  "web_search",
  "write_agent",
];

const KNOWN_ANCHORS = [
  {
    semanticAlias: "RootProgram",
    anchors: ["mke", "RootProgram"],
    role: "Builds the root copilot command, global options, help topics, and subcommands.",
    docs: "docs/00-start-here/main-feature-map.md",
  },
  {
    semanticAlias: "mainCliAction(...) / runtime dispatcher",
    anchors: ["j$o", "u1t", "--server", "--headless"],
    role: "Turns argv/env/settings/session state into TUI, prompt, server/headless, or ACP mode.",
    docs: "docs/01-runtime-lifecycle/mode-dispatch-and-runtime-startup.md",
  },
  {
    semanticAlias: "InteractiveTuiFlow",
    anchors: ["j$o", "jQa"],
    role: "Runs the terminal UI, slash commands, dialogs, permissions, and background session UI.",
    docs: "docs/01-runtime-lifecycle/tui-and-slash-commands.md",
  },
  {
    semanticAlias: "runPromptMode(...)",
    anchors: ["u1t", "session.task_complete"],
    role: "Handles -p/stdin/non-TTY execution, streaming, JSONL, autopilot continuation, and pending background work.",
    docs: "docs/01-runtime-lifecycle/mode-dispatch-and-runtime-startup.md",
  },
  {
    semanticAlias: "buildSystemPrompt(...) / createGeneralPurposeSystemPrompt(...)",
    anchors: ["X3e", "Wmt", "currentSystemMessage"],
    role: "Assembles identity, tools, instructions, skills, memory, runtime state, and provider-visible system context.",
    docs: "docs/02-context-model-loop/prompt-sources.md",
  },
  {
    semanticAlias: "Session runtime / runAgenticLoop",
    anchors: ["runAgenticLoop", "getCompletionWithTools", "tool.execution_complete"],
    role: "Queues prompts, builds requests, streams model output, dispatches tools, emits durable events, and handles retries.",
    docs: "docs/04-sessions-persistence-remote/session-manager-and-event-replay.md",
  },
  {
    semanticAlias: "Conversation session end-to-end",
    anchors: ["--resume", "--continue", "session.start", "session.resume", "session.tools_updated"],
    role: "Connects startup selection, event replay, workspace state, tool refresh, UI projection, indexing, remote export, and shutdown.",
    docs: "docs/04-sessions-persistence-remote/conversation-session-end-to-end.md",
  },
  {
    semanticAlias: "Session persistence pipeline",
    anchors: ["events.jsonl", "workspace.yaml", "session-store.db", "session.snapshot_rewind", "session_store_sql"],
    role: "Maps JSONL replay logs, SessionFs, workspace sidecars, SQLite/FTS, reindex, fork, rewind, checkpoints, and cloud sync.",
    docs: "docs/04-sessions-persistence-remote/session-persistence-replay-and-indexing.md",
  },
  {
    semanticAlias: "assembleRuntimeTools(...)",
    anchors: ["HCr", "assembleRuntimeTools", "session.tools_updated"],
    role: "Builds the final model-visible toolset from built-ins, MCP, SDK extensions, plugins, custom agents, filters, and gates.",
    docs: "docs/03-tools-integrations-security/runtime-tool-assembly-and-filtering.md",
  },
  {
    semanticAlias: "Built-in tools, execution events, and results",
    anchors: ["tool.execution_start", "tool.execution_partial_result", "tool.execution_complete"],
    role: "Runs model tool calls through permission/hook/execution/event/telemetry boundaries.",
    docs: "docs/03-tools-integrations-security/built-in-tools-execution-events.md",
  },
  {
    semanticAlias: "PermissionService",
    anchors: ["PermissionService", "permissionRequest", "allow-tool", "deny-tool"],
    role: "Applies tool/path/URL/MCP/hook approval policy before potentially dangerous actions.",
    docs: "docs/03-tools-integrations-security/tool-path-url-permissions.md",
  },
  {
    semanticAlias: "McpHost and MCP task bridge",
    anchors: ["McpHost", "p8e", "callToolStream", "taskSupport"],
    role: "Connects MCP servers, exposes tools/resources/prompts, and maps long-running MCP task streams into task records.",
    docs: "docs/03-tools-integrations-security/mcp-host-transport-and-tools.md",
  },
  {
    semanticAlias: "Plugin and SDK extension loading",
    anchors: ["pluginCommand", "setupExtensionsForSession", "session.extensions_loaded", "EXTENSIONS"],
    role: "Loads plugin-contributed skills/agents/hooks/MCP/LSP and SDK extension tools/hooks/commands.",
    docs: "docs/03-tools-integrations-security/plugins-extensions-and-capabilities.md",
  },
  {
    semanticAlias: "TaskRegistry",
    anchors: ["B3", "TaskRegistry", "agent_completed", "agent_idle"],
    role: "Tracks background, multi-turn, and MCP task state, results, cancellation, and notifications.",
    docs: "docs/06-agents-automation/agent-task-orchestration.md",
  },
  {
    semanticAlias: "createTaskTool(...)",
    anchors: ["I6n", "H3=\"task\"", "agent_type"],
    role: "Exposes subagent dispatch to the main model via the task tool schema and callback.",
    docs: "docs/06-agents-automation/agent-task-orchestration.md",
  },
  {
    semanticAlias: "BUILT_IN_AGENTS",
    anchors: ["nHn", "general-purpose", "rem-agent"],
    role: "Catalogs built-in agent types and their runtime availability filters.",
    docs: "docs/06-agents-automation/built-in-agents.md",
  },
  {
    semanticAlias: "SessionAgentExecutor",
    anchors: ["dZ", "SessionAgentExecutor.execute"],
    role: "Runs built-in/custom session-based subagents, hook loops, multi-turn waits, and teardown.",
    docs: "docs/06-agents-automation/agent-task-orchestration.md",
  },
  {
    semanticAlias: "Feature gates",
    anchors: ["gLt", "v1e", "LiveFeatureFlagService", "COPILOT_EXP_"],
    role: "Resolves static gates, environment/settings overrides, and experiment treatments.",
    docs: "docs/05-hosted-agent-ops/feature-gates.md",
  },
  {
    semanticAlias: "Telemetry and shutdown",
    anchors: ["ShutdownService", "OpenTelemetry", "COLLECT_DEBUG_LOGS", "debug"],
    role: "Handles logging, telemetry, diagnostics, update/version flows, signal handling, and cleanup.",
    docs: "docs/05-hosted-agent-ops/telemetry-update-and-shutdown.md",
  },
  {
    semanticAlias: "Debug bundle redaction boundary",
    anchors: ["/collect-debug-logs", "feedback-manifest.json", "additional-logs", "--secret-env-vars", "public:false"],
    role: "Explains what enters diagnostic bundles, which redaction layers apply, and where local archive or secret gist sharing remains sensitive.",
    docs: "docs/05-hosted-agent-ops/debug-bundle-redaction-boundaries.md",
  },
  {
    semanticAlias: "HostedAgentEnvironmentEnvelope",
    anchors: ["TWe", "COPILOT_AGENT_ACTION", "GITHUB_COPILOT_MCP_JSON", "GITHUB_COPILOT_OIDC_MCP_TOKEN", "COPILOT_OTEL_ENABLED"],
    role: "Maps hosted coding-agent environment variables, MCP/OIDC bootstrap, OTel switches, firewall/trajectory output, and bundled managed-agent SDK watchpoints.",
    docs: "docs/05-hosted-agent-ops/hosted-agent-environment.md",
  },
];

const MAIN_PATHS = [
  {
    path: "Startup and runtime mode routing",
    trigger: "`copilot` argv, stdin, TTY, and global options",
    anchorSeeds: ["RootProgram", "mainCliAction", "j$o", "u1t", "--server", "--headless", "--acp"],
    output: "Interactive TUI, prompt mode, server/headless JSON-RPC, or ACP mode.",
    docs: "docs/00-start-here/main-feature-map.md",
  },
  {
    path: "Session and event lifecycle",
    trigger: "new/resume/continue/name/fork/session APIs",
    anchorSeeds: ["session.start", "Session.send", "tool.execution_complete", "session.task_complete", "session.idle"],
    output: "Durable event log, UI projection, state files, background work, and completion/idle signals.",
    docs: "docs/04-sessions-persistence-remote/conversation-session-end-to-end.md",
  },
  {
    path: "Session persistence, search, and branching",
    trigger: "event writes, workspace sidecars, compaction checkpoints, /reindex, /fork, /undo, or /rewind",
    anchorSeeds: ["events.jsonl", "workspace.yaml", "session-store.db", "search_index", "session.snapshot_rewind"],
    output: "Replayable JSONL history, sidecar artifacts, derived SQLite/FTS indexes, forked branches, and rewind boundaries.",
    docs: "docs/04-sessions-persistence-remote/session-persistence-replay-and-indexing.md",
  },
  {
    path: "Prompt and context assembly",
    trigger: "session initialization, subagent creation, slash command prompt macro, provider request",
    anchorSeeds: ["buildSystemPrompt", "X3e", "Wmt", "loadCustomInstructions", "loadSkills", "currentSystemMessage"],
    output: "System/developer/user/tool messages shaped for a provider request.",
    docs: "docs/02-context-model-loop/prompt-sources.md",
  },
  {
    path: "Model request, streaming, retry, and compaction",
    trigger: "agent turn needs a completion with tools",
    anchorSeeds: ["getCompletionWithTools", "preRequest", "BasicTruncator", "CompactionProcessor", "rate limit"],
    output: "Provider request/response stream, retry/fallback behavior, request-size handling, and token-budget mutation.",
    docs: "docs/02-context-model-loop/resilience-rate-limits-concurrency.md",
  },
  {
    path: "Runtime tool assembly",
    trigger: "session/subagent tool initialization or tool surface invalidation",
    anchorSeeds: ["HCr", "assembleRuntimeTools", "initializeAndValidateTools", "session.tools_updated"],
    output: "Final model-visible tool definitions, filters, permissions, and dynamic tool invalidation.",
    docs: "docs/03-tools-integrations-security/runtime-tool-assembly-and-filtering.md",
  },
  {
    path: "Tool execution lifecycle",
    trigger: "model emits a tool call",
    anchorSeeds: ["tool.execution_start", "preToolUse", "permissionRequest", "tool.execution_complete"],
    output: "Permissioned execution, partial/progress/result events, telemetry, and session history records.",
    docs: "docs/03-tools-integrations-security/built-in-tools-execution-events.md",
  },
  {
    path: "Subagent and task orchestration",
    trigger: "main model calls `task` or slash macro steers toward an agent",
    anchorSeeds: ["I6n", "TaskRegistry", "B3", "SessionAgentExecutor", "dZ", "agent_completed"],
    output: "Sync/background/multi-turn agent state, result handoff, and subagent lifecycle events.",
    docs: "docs/06-agents-automation/agent-task-orchestration.md",
  },
  {
    path: "Integrations and extension loading",
    trigger: "MCP config, plugin dirs, installed plugins, SDK extension feature gate, IDE bridge",
    anchorSeeds: ["McpHost", "plugin", "setupExtensionsForSession", "session.extensions_loaded", "callIdeTool"],
    output: "External tools, hooks, prompts, resources, agents, skills, LSP/IDE surfaces, and SDK commands.",
    docs: "docs/03-tools-integrations-security/plugins-extensions-and-capabilities.md",
  },
  {
    path: "Permissions, policy, and sandbox boundaries",
    trigger: "tool/path/URL/MCP/hook/shell action needs approval or policy check",
    anchorSeeds: ["PermissionService", "allow-tool", "deny-tool", "content exclusion", "sandbox"],
    output: "Allow/deny/redaction/sandbox decisions before dangerous or policy-sensitive work.",
    docs: "docs/03-tools-integrations-security/tool-path-url-permissions.md",
  },
  {
    path: "Operations, diagnostics, and shutdown",
    trigger: "diagnostic command, telemetry/logging event, update check, signal/shutdown",
    anchorSeeds: ["/diagnose", "/collect-debug-logs", "ShutdownService", "OpenTelemetry", "update"],
    output: "Debug bundles, telemetry/logs/traces, update/version behavior, and cleanup.",
    docs: "docs/05-hosted-agent-ops/telemetry-update-and-shutdown.md",
  },
  {
    path: "Hosted agent environment and ops",
    trigger: "hosted coding-agent job environment, MCP/OIDC bootstrap, OTel env, firewall log, or trajectory output",
    anchorSeeds: ["COPILOT_AGENT_PROMPT", "COPILOT_AGENT_ACTION", "GITHUB_COPILOT_MCP_JSON", "GITHUB_COPILOT_OIDC_MCP_TOKEN", "COPILOT_AGENT_FIREWALL_LOG_FILE", "CPD_SAVE_TRAJECTORY_OUTPUT"],
    output: "Hosted settings envelope, default GitHub MCP policy, OIDC token injection, OTel exporter config, firewall summaries, and trajectory files.",
    docs: "docs/05-hosted-agent-ops/hosted-agent-environment.md",
  },
  {
    path: "Debug bundle and redaction boundary",
    trigger: "/feedback, /bug, /collect-debug-logs, root debug collection flags, or support archive upload",
    anchorSeeds: ["/collect-debug-logs", "debugLogPaths", "feedback-manifest.json", "additional-logs", "--secret-env-vars"],
    output: "Support artifact contents, redaction layers, local archive versus secret gist implications, and safety caveats.",
    docs: "docs/05-hosted-agent-ops/debug-bundle-redaction-boundaries.md",
  },
];

function usage() {
  return `Generate a lightweight source atlas for the extracted Copilot CLI app.js bundle.

Usage:
  node scripts/index-app-js.mjs [options]

Options:
  --app <file>                app.js path to scan (default: ./copilot-cli-pkg/app.js)
  --out <dir>                 output directory (default: ./source-atlas)
  --markdown-limit <number>   max rows per generated Markdown table section (default: ${DEFAULT_MARKDOWN_LIMIT})
  --no-json                   skip JSON outputs
  --no-markdown               skip Markdown outputs
  -h, --help                  show this help

Examples:
  node scripts/index-app-js.mjs
  node scripts/index-app-js.mjs --app artifacts/copilot-cli-pkg-test/app.js --out source-atlas-test
`;
}

function parseArgs(argv) {
  const options = {
    appPath: DEFAULT_APP_JS,
    outDir: DEFAULT_OUT_DIR,
    markdownLimit: DEFAULT_MARKDOWN_LIMIT,
    writeJson: true,
    writeMarkdown: true,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const readValue = () => {
      const value = argv[i + 1];
      if (!value || value.startsWith("-")) {
        throw new Error(`Missing value for ${arg}`);
      }
      i += 1;
      return value;
    };

    if (arg === "-h" || arg === "--help") {
      options.help = true;
    } else if (arg === "--app") {
      options.appPath = resolve(readValue());
    } else if (arg.startsWith("--app=")) {
      options.appPath = resolve(arg.slice("--app=".length));
    } else if (arg === "--out") {
      options.outDir = resolve(readValue());
    } else if (arg.startsWith("--out=")) {
      options.outDir = resolve(arg.slice("--out=".length));
    } else if (arg === "--markdown-limit") {
      options.markdownLimit = Number(readValue());
    } else if (arg.startsWith("--markdown-limit=")) {
      options.markdownLimit = Number(arg.slice("--markdown-limit=".length));
    } else if (arg === "--no-json") {
      options.writeJson = false;
    } else if (arg === "--no-markdown") {
      options.writeMarkdown = false;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (!Number.isInteger(options.markdownLimit) || options.markdownLimit < 1) {
    throw new Error("--markdown-limit must be a positive integer");
  }

  return options;
}

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

function buildLineStarts(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i += 1) {
    if (text.charCodeAt(i) === 10) {
      starts.push(i + 1);
    }
  }
  return starts;
}

function lineNumberForIndex(lineStarts, index) {
  let low = 0;
  let high = lineStarts.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (lineStarts[mid] <= index) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return high + 1;
}

function snippet(text, index, length = 180) {
  const start = Math.max(0, index - Math.floor(length / 3));
  const end = Math.min(text.length, start + length);
  return text.slice(start, end).replace(/\s+/g, " ").trim();
}

function uniqueByName(items) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    const key = item.name;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(item);
  }
  return result.sort((a, b) => a.name.localeCompare(b.name));
}

function occurrences(text, lineStarts, regex, normalize = (match) => match[0]) {
  const results = [];
  for (const match of text.matchAll(regex)) {
    const value = normalize(match);
    if (!value) {
      continue;
    }
    results.push({ name: value, line: lineNumberForIndex(lineStarts, match.index ?? 0) });
  }
  return uniqueByName(results);
}

function declarationOccurrences(text, lineStarts, regex, kind, normalize = (match) => match[1]) {
  const results = [];
  for (const match of text.matchAll(regex)) {
    const name = normalize(match);
    if (!name) {
      continue;
    }
    const index = match.index ?? 0;
    results.push({
      name,
      kind,
      line: lineNumberForIndex(lineStarts, index),
      snippet: snippet(text, index),
    });
  }
  return uniqueByName(results);
}

function declarationBlocks(text, lineStarts) {
  const blocks = [];
  const regex = /\b(var|let|const)\s+([^;\n]{1,900})/g;
  for (const match of text.matchAll(regex)) {
    const kind = match[1];
    const body = match[2];
    const names = [];
    for (const nameMatch of body.matchAll(/(?:^|,)\s*([A-Za-z_$][\w$]*)\s*(?=,|=|$)/g)) {
      names.push(nameMatch[1]);
    }
    if (names.length === 0) {
      continue;
    }
    const index = match.index ?? 0;
    blocks.push({
      kind,
      line: lineNumberForIndex(lineStarts, index),
      names: names.slice(0, 24),
      nameCount: names.length,
      snippet: snippet(text, index, 220),
    });
  }
  return blocks;
}

function firstLineForNeedle(text, lineStarts, needle) {
  const index = text.indexOf(needle);
  return index === -1 ? undefined : lineNumberForIndex(lineStarts, index);
}

function resolveKnownAnchors(text, lineStarts) {
  return KNOWN_ANCHORS.map((entry) => {
    const resolved = entry.anchors
      .map((anchor) => ({ anchor, line: firstLineForNeedle(text, lineStarts, anchor) }))
      .filter((item) => item.line !== undefined);
    return {
      ...entry,
      resolved,
      firstLine: resolved.length > 0 ? Math.min(...resolved.map((item) => item.line)) : undefined,
    };
  });
}

function resolveMainPaths(text, lineStarts) {
  return MAIN_PATHS.map((entry) => ({
    ...entry,
    resolvedSeeds: entry.anchorSeeds
      .map((anchor) => ({ anchor, line: firstLineForNeedle(text, lineStarts, anchor) }))
      .filter((item) => item.line !== undefined),
  }));
}

function collectReferencedDocs() {
  return [...new Set([
    ...KNOWN_ANCHORS.map((entry) => entry.docs),
    ...MAIN_PATHS.map((entry) => entry.docs),
  ].filter(Boolean))].sort();
}

async function findMissingDocReferences(docRefs) {
  const missing = [];
  for (const docRef of docRefs) {
    try {
      await readFile(join(REPO_ROOT, docRef), "utf8");
    } catch {
      missing.push(docRef);
    }
  }
  return missing;
}

async function listPackagedDefinitions() {
  const definitionsDir = join(REPO_ROOT, "copilot-cli-pkg", "definitions");
  try {
    const entries = await readdir(definitionsDir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".yaml"))
      .map((entry) => `copilot-cli-pkg/definitions/${entry.name}`)
      .sort();
  } catch {
    return [];
  }
}

function markdownTable(headers, rows) {
  const escapeCell = (value) => String(value ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
  return [
    `| ${headers.map(escapeCell).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(escapeCell).join(" | ")} |`),
  ].join("\n");
}

function sampleRows(items, limit, mapper) {
  return items.slice(0, limit).map(mapper);
}

function renderReadme(summary, resolvedMainPaths, resolvedKnownAnchors, markdownLimit) {
  const mainPathRows = resolvedMainPaths.map((entry) => [
    entry.path,
    entry.trigger,
    entry.output,
    entry.resolvedSeeds.slice(0, 5).map((seed) => `${seed.anchor} ~${seed.line}`).join(", "),
    entry.docs,
  ]);
  const anchorRows = resolvedKnownAnchors
    .filter((entry) => entry.firstLine !== undefined)
    .sort((a, b) => a.firstLine - b.firstLine)
    .map((entry) => [
      entry.semanticAlias,
      `~${entry.firstLine}`,
      entry.resolved.slice(0, 4).map((item) => `${item.anchor} ~${item.line}`).join(", "),
      entry.role,
      entry.docs,
    ]);

  return `# app.js generated source index

Generated: ${summary.generatedAt}

Source: \`${summary.source.relativePath}\`

Output directory: \`${summary.output.relativePath}\`

SHA-256: \`${summary.source.sha256}\`

This directory is generated by \`scripts/index-app-js.mjs\`. It is a lightweight source atlas for the minified \`copilot-cli-pkg/app.js\` bundle: raw symbol/constant inventories plus a small hand-maintained semantic anchor seed list.

## Bundle summary

${markdownTable(["Metric", "Value"], Object.entries(summary.counts))}

## Generated files

| File | Purpose |
|---|---|
| \`summary.json\` | Machine-readable counts, source hash, output manifest, known semantic anchors, and main path seeds. |
| \`surface-index.json\` | Raw env vars, event strings, slash command candidates, JSON-RPC-ish methods, tool-name hits, feature keys, and packaged definitions. |
| \`declarations.json\` | Function/class/declaration-block inventory with approximate lines and snippets. |
| \`constants.md\` | Human-readable constants/string-surface inventory. |
| \`symbols.md\` | Human-readable symbol/declaration inventory, truncated to ${markdownLimit} rows per section. |

## Main path seeds

These are not complete call graphs. They are high-signal starting points for tracing the major runtime paths.

${markdownTable(["Path", "Trigger", "Output", "Resolved seeds", "Primary doc"], mainPathRows)}

## Semantic anchor seeds

${markdownTable(["Semantic alias", "First line", "Resolved anchors", "Role", "Primary doc"], anchorRows)}

## Documentation reference check

Referenced docs: ${summary.documentation.referencedDocs.length}
Missing referenced docs: ${summary.documentation.missingDocReferences.length}

${summary.documentation.missingDocReferences.length === 0 ? "All hand-maintained atlas doc references exist in the current `docs/` tree." : markdownTable(["Missing doc reference"], summary.documentation.missingDocReferences.map((docRef) => [`\`${docRef}\``]))}

## Regeneration

Run from the repository root:

\`\`\`sh
node scripts/index-app-js.mjs
\`\`\`

For a second extracted bundle, override the input/output paths:

\`\`\`sh
node scripts/index-app-js.mjs --app artifacts/copilot-cli-pkg-test/app.js --out source-atlas-test
\`\`\`
`;
}

function renderConstants(surface, markdownLimit) {
  const envRows = sampleRows(surface.envVars, markdownLimit, (item) => [`\`${item.name}\``, `~${item.line}`]);
  const eventRows = sampleRows(surface.eventStrings, markdownLimit, (item) => [`\`${item.name}\``, `~${item.line}`]);
  const rpcRows = sampleRows(surface.jsonRpcMethods, markdownLimit, (item) => [`\`${item.name}\``, `~${item.line}`]);
  const slashRows = sampleRows(surface.confirmedSlashCommands, markdownLimit, (name) => {
    const match = surface.slashCommandCandidates.find((item) => item.name === name);
    return [`\`${name}\``, match ? `~${match.line}` : "confirmed from curated list"];
  });
  const slashCandidateRows = sampleRows(surface.slashCommandCandidates, markdownLimit, (item) => [`\`${item.name}\``, `~${item.line}`]);
  const toolRows = sampleRows(surface.toolNameHits, markdownLimit, (item) => [`\`${item.name}\``, `~${item.line}`]);
  const featureRows = sampleRows(surface.featureKeys, markdownLimit, (item) => [`\`${item.name}\``, `~${item.line}`]);
  const expRows = sampleRows(surface.experimentFlagStrings, markdownLimit, (item) => [`\`${item.name}\``, `~${item.line}`]);
  const definitionRows = surface.packagedDefinitions.map((name) => [`\`${name}\``]);

  return `# app.js constants and string surfaces

Generated by \`scripts/index-app-js.mjs\`. Line numbers are approximate anchors in the scanned bundle.

## Environment variables

${markdownTable(["Name", "First line"], envRows)}

## Feature/config-like object keys

These are raw uppercase object keys and include feature gates plus other config/schema keys. Treat them as candidates until manually classified.

${markdownTable(["Key", "First line"], featureRows)}

## Experiment flag strings

${markdownTable(["String", "First line"], expRows)}

## Event strings

${markdownTable(["Event", "First line"], eventRows)}

## JSON-RPC-ish method strings

${markdownTable(["Method", "First line"], rpcRows)}

## Confirmed slash commands

${markdownTable(["Command", "First line / source"], slashRows)}

## Slash-like raw string candidates

This raw list intentionally includes false positives such as URL paths, API routes, and help text fragments. Use it for discovery, not as a confirmed command list.

${markdownTable(["Candidate", "First line"], slashCandidateRows)}

## Known tool-name hits

This scans for a curated list of known built-in/tool-surface names. It is not a complete dynamic tool inventory.

${markdownTable(["Tool name", "First line"], toolRows)}

## Packaged agent definition files

${markdownTable(["File"], definitionRows)}
`;
}

function renderSymbols(declarations, markdownLimit) {
  const functionRows = sampleRows(declarations.functions, markdownLimit, (item) => [`\`${item.name}\``, `~${item.line}`, item.snippet]);
  const classRows = sampleRows(declarations.classes, markdownLimit, (item) => [`\`${item.name}\``, `~${item.line}`, item.snippet]);
  const blockRows = sampleRows(declarations.declarationBlocks, markdownLimit, (item) => [
    item.kind,
    `~${item.line}`,
    item.nameCount,
    item.names.map((name) => `\`${name}\``).join(", "),
    item.snippet,
  ]);

  return `# app.js symbol and declaration inventory

Generated by \`scripts/index-app-js.mjs\`. This is a discovery index, not a clean source map. Minified symbols are unstable across package releases.

## Function declarations

${markdownTable(["Name", "Line", "Snippet"], functionRows)}

## Class declarations and class assignments

${markdownTable(["Name", "Line", "Snippet"], classRows)}

## Declaration blocks

Declaration blocks are raw \`var\`/\`let\`/\`const\` groups. They are useful for finding bundled module-local constants, but many entries are minified temporaries.

${markdownTable(["Kind", "Line", "Names", "Sample names", "Snippet"], blockRows)}
`;
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }

  const text = await readFile(options.appPath, "utf8");
  const lines = text.split(/\r?\n/);
  const lineStarts = buildLineStarts(text);
  const generatedAt = new Date().toISOString();
  const sourceRelativePath = relative(REPO_ROOT, options.appPath);
  const outputRelativePath = relative(REPO_ROOT, options.outDir);

  const functions = declarationOccurrences(text, lineStarts, /\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g, "function");
  const classes = uniqueByName([
    ...declarationOccurrences(text, lineStarts, /\bclass\s+([A-Za-z_$][\w$]*)\b/g, "class declaration"),
    ...declarationOccurrences(text, lineStarts, /\b([A-Za-z_$][\w$]*)\s*=\s*class\b/g, "class assignment"),
  ]);
  const blocks = declarationBlocks(text, lineStarts);

  const envVars = occurrences(text, lineStarts, /\b(?:COPILOT|GITHUB|GH)_[A-Z0-9_]+\b/g);
  const eventRegex = new RegExp("[\"'`](" + EVENT_PREFIXES.join("|") + ")\\.[a-zA-Z0-9_.:-]+[\"'`]", "g");
  const eventStrings = occurrences(text, lineStarts, eventRegex, (match) => match[0].slice(1, -1));
  const jsonRpcMethods = occurrences(
    text,
    lineStarts,
    /["'`]([a-zA-Z][\w-]*(?:\.[a-zA-Z][\w-]*){1,4})["'`]/g,
    (match) => {
      const value = match[1];
      return RPC_PREFIXES.some((prefix) => value === prefix || value.startsWith(`${prefix}.`)) ? value : undefined;
    },
  );
  const slashCommandCandidates = occurrences(
    text,
    lineStarts,
    /["'`](\/[a-z][a-z0-9-]*)(?:\s[^"'`]*)?["'`]/g,
    (match) => match[1],
  ).filter((item) => /^\/[a-z][a-z0-9-]*$/.test(item.name));
  const confirmedSlashCommands = CONFIRMED_SLASH_COMMANDS.filter((name) => text.includes(name));
  const featureKeys = occurrences(text, lineStarts, /\b([A-Z][A-Z0-9_]{2,})\s*:/g, (match) => match[1]);
  const experimentFlagStrings = occurrences(text, lineStarts, /\bcopilot_cli_[a-z0-9_]+\b/g);
  const toolNameHits = KNOWN_TOOL_NAMES
    .map((name) => ({ name, line: firstLineForNeedle(text, lineStarts, name) }))
    .filter((item) => item.line !== undefined)
    .sort((a, b) => a.name.localeCompare(b.name));
  const packagedDefinitions = await listPackagedDefinitions();
  const resolvedKnownAnchors = resolveKnownAnchors(text, lineStarts);
  const resolvedMainPaths = resolveMainPaths(text, lineStarts);
  const referencedDocs = collectReferencedDocs();
  const missingDocReferences = await findMissingDocReferences(referencedDocs);

  const summary = {
    generatedAt,
    source: {
      path: options.appPath,
      relativePath: sourceRelativePath,
      sha256: sha256(text),
      bytes: Buffer.byteLength(text),
      lines: lines.length,
    },
    output: {
      path: options.outDir,
      relativePath: outputRelativePath,
    },
    counts: {
      functions: functions.length,
      classes: classes.length,
      declarationBlocks: blocks.length,
      envVars: envVars.length,
      featureKeys: featureKeys.length,
      experimentFlagStrings: experimentFlagStrings.length,
      eventStrings: eventStrings.length,
      jsonRpcMethods: jsonRpcMethods.length,
      confirmedSlashCommands: confirmedSlashCommands.length,
      slashCommandCandidates: slashCommandCandidates.length,
      knownToolNameHits: toolNameHits.length,
      packagedAgentDefinitions: packagedDefinitions.length,
      knownSemanticAnchors: resolvedKnownAnchors.length,
      mainPathSeeds: resolvedMainPaths.length,
      referencedDocs: referencedDocs.length,
      missingDocReferences: missingDocReferences.length,
    },
    documentation: {
      referencedDocs,
      missingDocReferences,
    },
    knownAnchors: resolvedKnownAnchors,
    mainPaths: resolvedMainPaths,
    generatedFiles: [
      "README.md",
      "constants.md",
      "symbols.md",
      "summary.json",
      "surface-index.json",
      "declarations.json",
    ],
  };

  const surface = {
    generatedAt,
    source: summary.source,
    envVars,
    featureKeys,
    experimentFlagStrings,
    eventStrings,
    jsonRpcMethods,
    confirmedSlashCommands,
    slashCommandCandidates,
    toolNameHits,
    packagedDefinitions,
  };

  const declarations = {
    generatedAt,
    source: summary.source,
    functions,
    classes,
    declarationBlocks: blocks,
  };

  await mkdir(options.outDir, { recursive: true });

  if (options.writeJson) {
    await writeJson(join(options.outDir, "summary.json"), summary);
    await writeJson(join(options.outDir, "surface-index.json"), surface);
    await writeJson(join(options.outDir, "declarations.json"), declarations);
  }

  if (options.writeMarkdown) {
    await writeFile(join(options.outDir, "README.md"), renderReadme(summary, resolvedMainPaths, resolvedKnownAnchors, options.markdownLimit));
    await writeFile(join(options.outDir, "constants.md"), renderConstants(surface, options.markdownLimit));
    await writeFile(join(options.outDir, "symbols.md"), renderSymbols(declarations, options.markdownLimit));
  }

  console.log(`Indexed ${sourceRelativePath}`);
  console.log(`Output: ${outputRelativePath}`);
  console.log(`Functions: ${functions.length}`);
  console.log(`Classes: ${classes.length}`);
  console.log(`Declaration blocks: ${blocks.length}`);
  console.log(`Env vars: ${envVars.length}`);
  console.log(`Events: ${eventStrings.length}`);
  console.log(`Confirmed slash commands: ${confirmedSlashCommands.length}`);
}

main().catch((error) => {
  console.error(`index-app-js: ${error.message}`);
  console.error(`\n${usage()}`);
  process.exit(1);
});
