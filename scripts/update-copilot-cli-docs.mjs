#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PACKAGE_DIR = join(REPO_ROOT, "copilot-cli-pkg");
const PACKAGE_JSON = join(PACKAGE_DIR, "package.json");
const ATLAS_SUMMARY = join(REPO_ROOT, "source-atlas", "summary.json");
const ATLAS_SURFACE = join(REPO_ROOT, "source-atlas", "surface-index.json");
const SOURCE_ATLAS_DOC = join(
  REPO_ROOT,
  "docs",
  "99-research-atlas",
  "source-atlas.md",
);
const DEFAULT_REPORT = join(
  REPO_ROOT,
  "docs",
  "00-start-here",
  "latest-package-update.md",
);
const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const SURFACE_KEYS = [
  "envVars",
  "featureKeys",
  "experimentFlagStrings",
  "eventStrings",
  "jsonRpcMethods",
  "confirmedSlashCommands",
  "slashCommandCandidates",
  "toolNameHits",
  "packagedDefinitions",
];

function usage() {
  return `Check npm for a newer Copilot CLI package and refresh extracted evidence.

Usage:
  node scripts/update-copilot-cli-docs.mjs [options]

Options:
  --check-only                Compare versions without changing files
  --refresh-metadata-only     Refresh version/atlas prose from current files only
  --force                     Refresh even when the version is unchanged
  --latest-version <version>  Override npm's latest version (useful for tests)
  --report <path>             Generated report path
                              (default: docs/00-start-here/latest-package-update.md)
  -h, --help                  Show this help
`;
}

function readValue(argv, index, flag) {
  const value = argv[index + 1];
  if (!value || value.startsWith("-")) {
    throw new Error(`Missing value for ${flag}`);
  }
  return value;
}

function parseArgs(argv) {
  const options = {
    checkOnly: false,
    metadataOnly: false,
    force: false,
    latestVersion: undefined,
    reportPath: DEFAULT_REPORT,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "-h" || arg === "--help") {
      options.help = true;
    } else if (arg === "--check-only") {
      options.checkOnly = true;
    } else if (arg === "--refresh-metadata-only") {
      options.metadataOnly = true;
    } else if (arg === "--force") {
      options.force = true;
    } else if (arg === "--latest-version") {
      options.latestVersion = readValue(argv, index, arg);
      index += 1;
    } else if (arg.startsWith("--latest-version=")) {
      options.latestVersion = arg.slice("--latest-version=".length);
    } else if (arg === "--report") {
      options.reportPath = resolve(readValue(argv, index, arg));
      index += 1;
    } else if (arg.startsWith("--report=")) {
      options.reportPath = resolve(arg.slice("--report=".length));
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return options;
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function parseVersion(version) {
  if (!VERSION_PATTERN.test(version)) {
    throw new Error(`Unexpected version: ${version}`);
  }

  const [main, prerelease = ""] = version.split("-", 2);
  return {
    raw: version,
    main: main.split(".").map(Number),
    prerelease: prerelease ? prerelease.split(".") : [],
  };
}

function compareIdentifiers(left, right) {
  const leftNumber = /^\d+$/.test(left) ? Number(left) : undefined;
  const rightNumber = /^\d+$/.test(right) ? Number(right) : undefined;
  if (leftNumber !== undefined && rightNumber !== undefined) {
    return Math.sign(leftNumber - rightNumber);
  }
  if (leftNumber !== undefined) return -1;
  if (rightNumber !== undefined) return 1;
  return left.localeCompare(right);
}

function compareVersions(leftVersion, rightVersion) {
  const left = parseVersion(leftVersion);
  const right = parseVersion(rightVersion);

  for (let index = 0; index < 3; index += 1) {
    if (left.main[index] !== right.main[index]) {
      return Math.sign(left.main[index] - right.main[index]);
    }
  }

  if (left.prerelease.length === 0 && right.prerelease.length === 0) return 0;
  if (left.prerelease.length === 0) return 1;
  if (right.prerelease.length === 0) return -1;

  const length = Math.max(left.prerelease.length, right.prerelease.length);
  for (let index = 0; index < length; index += 1) {
    if (left.prerelease[index] === undefined) return -1;
    if (right.prerelease[index] === undefined) return 1;
    const comparison = compareIdentifiers(
      left.prerelease[index],
      right.prerelease[index],
    );
    if (comparison !== 0) return comparison;
  }
  return 0;
}

function getLatestVersion(override) {
  if (override) return parseVersion(override).raw;

  const stdout = execFileSync(
    "npm",
    ["view", "@github/copilot-linux-x64", "dist-tags.latest", "--json"],
    {
      cwd: REPO_ROOT,
      encoding: "utf8",
      maxBuffer: 4 * 1024 * 1024,
    },
  ).trim();

  const parsed = JSON.parse(stdout);
  const version = Array.isArray(parsed) ? parsed.at(-1) : parsed;
  if (typeof version !== "string") {
    throw new Error(`npm returned an invalid latest version: ${stdout}`);
  }
  return parseVersion(version).raw;
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: REPO_ROOT,
    stdio: "inherit",
    env: process.env,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`Command failed (${result.status}): ${command} ${args.join(" ")}`);
  }
}

function setOutput(name, value) {
  const rendered = String(value);
  console.log(`${name}=${rendered}`);
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${rendered}\n`);
  }
}

function itemName(item) {
  return typeof item === "string" ? item : item.name;
}

function diffSurface(previous = [], current = []) {
  const previousNames = new Set(previous.map(itemName));
  const currentNames = new Set(current.map(itemName));
  return {
    added: [...currentNames].filter((name) => !previousNames.has(name)).sort(),
    removed: [...previousNames].filter((name) => !currentNames.has(name)).sort(),
  };
}

function escapeTable(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString("en-US");
}

function renderList(items, limit = 40) {
  if (items.length === 0) return "- None.";
  const visible = items.slice(0, limit).map((item) => `- \`${item}\``);
  if (items.length > limit) {
    visible.push(`- ...and ${items.length - limit} more.`);
  }
  return visible.join("\n");
}

function releaseEntriesBetween(changelog, previousVersion, latestVersion) {
  return Object.entries(changelog)
    .filter(([version, entries]) => {
      return (
        /^\d+\.\d+\.\d+$/.test(version) &&
        Array.isArray(entries) &&
        compareVersions(version, previousVersion) > 0 &&
        compareVersions(version, latestVersion) <= 0
      );
    })
    .sort(([left], [right]) => compareVersions(right, left));
}

function renderReleaseSection(releases) {
  if (releases.length === 0) {
    return "No stable changelog entries were found between the two package versions.";
  }

  return releases
    .map(([version, entries]) => {
      const added = entries.filter((entry) => entry.type === "added");
      const improved = entries.filter((entry) => entry.type === "improved");
      const fixed = entries.filter((entry) => entry.type === "fixed");
      const relevantFixed = fixed.filter((entry) =>
        /command|setting|session|agent|tool|mcp|plugin|canvas|voice|worktree|sandbox|model|provider|api|sdk|resume|permission|hook|shell|context|memory|skill|remote|search|protocol/i.test(
          String(entry.description),
        ),
      );
      const details = [...added, ...improved, ...relevantFixed]
        .slice(0, 40)
        .map(
          (entry) =>
            `- **${entry.type}:** ${String(entry.description).replaceAll("\n", " ")}`,
        );
      if (details.length === 0) details.push("- No added/improved entries.");
      return [
        `### ${version}`,
        "",
        `Added: ${added.length}; improved: ${improved.length}; fixed: ${fixed.length}.`,
        "",
        ...details,
      ].join("\n");
    })
    .join("\n\n");
}

function getPackageChanges() {
  const tracked = execFileSync(
    "git",
    ["diff", "--name-status", "--", "copilot-cli-pkg"],
    { cwd: REPO_ROOT, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 },
  )
    .trim()
    .split("\n")
    .filter(Boolean);
  const untracked = execFileSync(
    "git",
    ["ls-files", "--others", "--exclude-standard", "copilot-cli-pkg"],
    { cwd: REPO_ROOT, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 },
  )
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((filePath) => `A\t${filePath}`);
  return [...tracked, ...untracked].sort();
}

function replaceRequired(text, pattern, replacement, label) {
  if (!pattern.test(text)) {
    throw new Error(`Could not update ${label}; expected text was not found`);
  }
  return text.replace(pattern, replacement);
}

function updateVersionMetadata(version) {
  const rootReadmePath = join(REPO_ROOT, "README.md");
  const docsReadmePath = join(REPO_ROOT, "docs", "README.md");
  const featureMapPath = join(
    REPO_ROOT,
    "docs",
    "00-start-here",
    "main-feature-map.md",
  );
  const astroConfigPath = join(REPO_ROOT, "website", "astro.config.mjs");

  let rootReadme = readFileSync(rootReadmePath, "utf8");
  rootReadme = replaceRequired(
    rootReadme,
    /The current baseline is `[^`]+`;/,
    `The current baseline is \`${version}\`;`,
    "README.md current baseline",
  );
  writeFileSync(rootReadmePath, rootReadme, "utf8");

  let docsReadme = readFileSync(docsReadmePath, "utf8");
  docsReadme = replaceRequired(
    docsReadme,
    /The current package is `@github\/copilot` `[^`]+`\./,
    `The current package is \`@github/copilot\` \`${version}\`.`,
    "docs/README.md current package",
  );
  writeFileSync(docsReadmePath, docsReadme, "utf8");

  let featureMap = readFileSync(featureMapPath, "utf8");
  featureMap = replaceRequired(
    featureMap,
    /The current artifact is `[^`]+`\./,
    `The current artifact is \`${version}\`.`,
    "main feature map current artifact",
  );
  writeFileSync(featureMapPath, featureMap, "utf8");

  let astroConfig = readFileSync(astroConfigPath, "utf8");
  astroConfig = replaceRequired(
    astroConfig,
    /Reverse-engineering wiki for the @github\/copilot CLI [^ ]+ bundle and SDK\./,
    `Reverse-engineering wiki for the @github/copilot CLI ${version} bundle and SDK.`,
    "website description version",
  );
  writeFileSync(astroConfigPath, astroConfig, "utf8");
}

function updateSourceAtlasDocumentation(version, atlas) {
  let text = readFileSync(SOURCE_ATLAS_DOC, "utf8");
  const lineThousands = Math.max(1, Math.floor(atlas.source.lines / 1000));
  text = replaceRequired(
    text,
    /without hand-reading all \d+k\+ minified lines/,
    `without hand-reading all ${lineThousands}k+ minified lines`,
    "source-atlas line-count summary",
  );
  text = replaceRequired(
    text,
    /^\| Bundle under analysis \| `copilot-cli-pkg\/app\.js` \| `[^`]+` lines \| .*$/m,
    `| Bundle under analysis | \`copilot-cli-pkg/app.js\` | \`${formatNumber(atlas.source.lines)}\` lines | Minified \`${version}\` production runtime that the index scans. |`,
    "source-atlas bundle row",
  );

  const rows = [
    ["Bundle size", formatNumber(atlas.source.bytes), " bytes"],
    ["Bundle lines", formatNumber(atlas.source.lines), ""],
    ["Function declarations", formatNumber(atlas.counts.functions), ""],
    ["Class declarations/assignments", formatNumber(atlas.counts.classes), ""],
    ["`var`/`let`/`const` declaration blocks", formatNumber(atlas.counts.declarationBlocks), ""],
    ["Environment-variable-like strings", formatNumber(atlas.counts.envVars), ""],
    ["Feature/config-like uppercase keys", formatNumber(atlas.counts.featureKeys), ""],
    ["Experiment flag strings", formatNumber(atlas.counts.experimentFlagStrings), ""],
    ["Event strings", formatNumber(atlas.counts.eventStrings), ""],
    ["JSON-RPC/method-like strings", formatNumber(atlas.counts.jsonRpcMethods), ""],
    ["Confirmed slash commands", formatNumber(atlas.counts.confirmedSlashCommands), ""],
    ["Raw slash-like candidates", formatNumber(atlas.counts.slashCommandCandidates), ""],
    ["Known tool-name hits", formatNumber(atlas.counts.knownToolNameHits), ""],
  ];

  for (const [label, value, suffix] of rows) {
    const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const escapedSuffix = suffix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    text = replaceRequired(
      text,
      new RegExp(
        `^\\| ${escapedLabel} \\| \\x60[^\\x60]+\\x60${escapedSuffix} \\|$`,
        "m",
      ),
      `| ${label} | \`${value}\`${suffix} |`,
      `source-atlas count row ${label}`,
    );
  }

  writeFileSync(SOURCE_ATLAS_DOC, text, "utf8");
}

function renderReport({
  previousPackage,
  currentPackage,
  previousAtlas,
  currentAtlas,
  previousSurface,
  currentSurface,
  changelog,
  packageChanges,
}) {
  const releases = releaseEntriesBetween(
    changelog,
    previousPackage.version,
    currentPackage.version,
  );
  const surfaceDiffs = Object.fromEntries(
    SURFACE_KEYS.map((key) => [
      key,
      diffSurface(previousSurface?.[key] ?? [], currentSurface?.[key] ?? []),
    ]),
  );
  const generatedAt = currentAtlas.generatedAt ?? new Date().toISOString();
  const packageChangePreview = packageChanges.slice(0, 80).map((line) => `- \`${line}\``);
  if (packageChanges.length > 80) {
    packageChangePreview.push(`- ...and ${packageChanges.length - 80} more files.`);
  }

  const surfaceRows = SURFACE_KEYS.map((key) => {
    const delta = surfaceDiffs[key];
    return `| \`${key}\` | +${delta.added.length} | -${delta.removed.length} |`;
  });

  const detailKeys = [
    "envVars",
    "experimentFlagStrings",
    "eventStrings",
    "jsonRpcMethods",
    "confirmedSlashCommands",
    "toolNameHits",
    "packagedDefinitions",
  ];
  const surfaceDetails = detailKeys
    .map((key) => {
      const delta = surfaceDiffs[key];
      return [
        `### ${key}`,
        "",
        "Added:",
        "",
        renderList(delta.added),
        "",
        "Removed:",
        "",
        renderList(delta.removed),
      ].join("\n");
    })
    .join("\n\n");

  return `# Latest automated Copilot CLI package update

> Generated by \`scripts/update-copilot-cli-docs.mjs\`. Treat atlas and changelog deltas as leads; confirm behavior in the extracted runtime or adjacent SDK/schema files before publishing authoritative prose.

Generated: \`${generatedAt}\`

## Package identity

| Field | Previous | Current |
|---|---:|---:|
| Package version | \`${escapeTable(previousPackage.version)}\` | \`${escapeTable(currentPackage.version)}\` |
| Build commit | \`${escapeTable(previousPackage.buildMetadata?.gitCommit ?? "unknown")}\` | \`${escapeTable(currentPackage.buildMetadata?.gitCommit ?? "unknown")}\` |
| \`app.js\` bytes | \`${formatNumber(previousAtlas.source?.bytes)}\` | \`${formatNumber(currentAtlas.source?.bytes)}\` |
| \`app.js\` lines | \`${formatNumber(previousAtlas.source?.lines)}\` | \`${formatNumber(currentAtlas.source?.lines)}\` |
| Functions | \`${formatNumber(previousAtlas.counts?.functions)}\` | \`${formatNumber(currentAtlas.counts?.functions)}\` |
| Classes | \`${formatNumber(previousAtlas.counts?.classes)}\` | \`${formatNumber(currentAtlas.counts?.classes)}\` |
| Declaration blocks | \`${formatNumber(previousAtlas.counts?.declarationBlocks)}\` | \`${formatNumber(currentAtlas.counts?.declarationBlocks)}\` |

## Named-surface delta

| Surface | Added | Removed |
|---|---:|---:|
${surfaceRows.join("\n")}

${surfaceDetails}

## Stable release notes

${renderReleaseSection(releases)}

## Extracted package file changes

Changed paths: ${packageChanges.length}.

${packageChangePreview.length ? packageChangePreview.join("\n") : "- None."}

## Documentation checklist

- [ ] Confirm every documented behavior in current \`copilot-cli-pkg/app.js\`, SDK declarations, schemas, help, or packaged definitions.
- [ ] Update an existing owning page instead of duplicating a subsystem page.
- [ ] Refresh version-specific architecture claims and mark removed paths as historical when useful.
- [ ] Update \`docs/SUMMARY.md\`, section indexes, and \`website/astro.config.mjs\` when navigation changes.
- [ ] Update [documentation opportunities](../99-research-atlas/documentation-opportunities.md) with closed or residual gaps.
- [ ] Run \`node scripts/check-docs.mjs\` and \`npm run build\` from \`website/\`.

## Suggested triage order

1. User-visible slash commands and root flags.
2. Settings, feature gates, permissions, and sandbox policy.
3. SDK/RPC methods and durable session events.
4. MCP, plugins, extensions, tools, and built-in agents.
5. Model/provider and context-window behavior.
6. Native or out-of-process architecture migrations.
`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }

  const previousPackage = readJson(PACKAGE_JSON);
  const currentVersion = parseVersion(previousPackage.version).raw;
  const latestVersion = getLatestVersion(options.latestVersion);
  const comparison = compareVersions(latestVersion, currentVersion);
  const updateAvailable = comparison > 0;

  if (comparison < 0 && !options.force) {
    throw new Error(
      `Refusing to downgrade from ${currentVersion} to npm latest ${latestVersion}`,
    );
  }

  setOutput("current_version", currentVersion);
  setOutput("latest_version", latestVersion);
  setOutput("update_available", updateAvailable);

  if (options.metadataOnly) {
    const currentAtlas = readJson(ATLAS_SUMMARY);
    updateVersionMetadata(currentVersion);
    updateSourceAtlasDocumentation(currentVersion, currentAtlas);
    setOutput("updated", false);
    console.log(`Refreshed deterministic metadata for Copilot CLI ${currentVersion}.`);
    return;
  }

  if (options.checkOnly) {
    setOutput("updated", false);
    console.log(
      updateAvailable
        ? `Copilot CLI update available: ${currentVersion} -> ${latestVersion}`
        : `Copilot CLI is current at ${currentVersion}`,
    );
    return;
  }

  if (!updateAvailable && !options.force) {
    setOutput("updated", false);
    console.log(`Copilot CLI is current at ${currentVersion}; nothing to update.`);
    return;
  }

  const previousAtlas = readJson(ATLAS_SUMMARY);
  const previousSurface = readJson(ATLAS_SURFACE);

  run(process.execPath, [
    "scripts/extract-copilot-cli-pkg.mjs",
    "--version",
    latestVersion,
    "--out",
    "copilot-cli-pkg",
  ]);

  const currentPackage = readJson(PACKAGE_JSON);
  if (currentPackage.version !== latestVersion) {
    throw new Error(
      `Extractor returned ${currentPackage.version}; expected ${latestVersion}`,
    );
  }

  run(process.execPath, ["--check", "copilot-cli-pkg/app.js"]);
  run(process.execPath, ["scripts/index-app-js.mjs"]);

  const currentAtlas = readJson(ATLAS_SUMMARY);
  const currentSurface = readJson(ATLAS_SURFACE);
  const changelog = readJson(join(PACKAGE_DIR, "changelog.json"));
  const packageChanges = getPackageChanges();
  const report = renderReport({
    previousPackage,
    currentPackage,
    previousAtlas,
    currentAtlas,
    previousSurface,
    currentSurface,
    changelog,
    packageChanges,
  });

  mkdirSync(dirname(options.reportPath), { recursive: true });
  writeFileSync(options.reportPath, report, "utf8");
  updateVersionMetadata(currentPackage.version);
  updateSourceAtlasDocumentation(currentPackage.version, currentAtlas);

  setOutput("previous_version", currentVersion);
  setOutput("updated", true);
  setOutput("report_path", relative(REPO_ROOT, options.reportPath));
  console.log(
    `Updated Copilot CLI ${currentVersion} -> ${latestVersion}; report: ${relative(
      REPO_ROOT,
      options.reportPath,
    )}`,
  );
}

main().catch((error) => {
  console.error(`update-copilot-cli-docs: ${error.message}`);
  process.exitCode = 1;
});
