#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const REPO_ROOT = resolve(dirname(SCRIPT_PATH), "..");
const DOCS_ROOT = join(REPO_ROOT, "docs");
const LATEST_REPORT = "00-start-here/latest-package-update.md";
const LATEST_ROUTE = "00-start-here/latest-package-update";
const SUBSYSTEM_REVIEW = "00-start-here/latest-subsystem-review.md";
const SUBSYSTEM_ROUTE = "00-start-here/latest-subsystem-review";
const SUBSYSTEM_MANIFEST = join(
  REPO_ROOT,
  "source-atlas",
  "subsystem-candidates.json",
);
const failures = [];

function parseArgs(argv) {
  const options = { allowPendingSubsystems: false };
  for (const arg of argv) {
    if (arg === "--allow-pending-subsystems") {
      options.allowPendingSubsystems = true;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }
  return options;
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

function checkMarkdownLinks(markdownFiles) {
  for (const file of markdownFiles) {
    const text = readFileSync(file, "utf8");
    const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;
    for (const match of text.matchAll(linkPattern)) {
      let href = match[1].trim();
      if (!href || href.startsWith("#") || /^(?:https?:|mailto:)/.test(href)) {
        continue;
      }
      if (href.startsWith("<") && href.endsWith(">")) {
        href = href.slice(1, -1);
      }
      href = href.split("#", 1)[0].split("?", 1)[0];
      if (!href) continue;

      let decoded;
      try {
        decoded = decodeURIComponent(href);
      } catch {
        decoded = href;
      }

      const target = resolve(dirname(file), decoded);
      if (!existsSync(target)) {
        failures.push(`Broken link: ${relative(REPO_ROOT, file)} -> ${href}`);
      }
    }
  }
}

function checkNavigation() {
  const summary = readFileSync(join(DOCS_ROOT, "SUMMARY.md"), "utf8");
  const astroConfig = readFileSync(
    join(REPO_ROOT, "website", "astro.config.mjs"),
    "utf8",
  );
  if (!summary.includes(LATEST_REPORT)) {
    failures.push("Latest package report is missing from docs/SUMMARY.md");
  }
  if (!astroConfig.includes(`/${LATEST_ROUTE}/`)) {
    failures.push("Latest package report is missing from the website sidebar");
  }
  if (!summary.includes(SUBSYSTEM_REVIEW)) {
    failures.push("Subsystem review is missing from docs/SUMMARY.md");
  }
  if (!astroConfig.includes(`/${SUBSYSTEM_ROUTE}/`)) {
    failures.push("Subsystem review is missing from the website sidebar");
  }
}

function checkOneGeneratedRoute(routeName, label) {
  const route = join(REPO_ROOT, "website", "dist", routeName, "index.html");
  if (!existsSync(route)) {
    failures.push(`Generated route is missing: ${relative(REPO_ROOT, route)}`);
    return;
  }

  const html = readFileSync(route, "utf8");
  const h1Count = (html.match(/<h1\b/g) ?? []).length;
  if (h1Count !== 1) {
    failures.push(`Generated ${label} route has ${h1Count} H1 elements`);
  }
}

function checkGeneratedRoutes() {
  checkOneGeneratedRoute(LATEST_ROUTE, "latest-package");
  checkOneGeneratedRoute(SUBSYSTEM_ROUTE, "subsystem-review");
}

function analyzeSubsystemReview(
  text,
  allowPending = false,
  expectedCandidateIds,
) {
  const reviewFailures = [];
  const decisions = [...text.matchAll(/^- Decision: `([^`]+)`$/gm)].map(
    (match) => match[1],
  );
  const allowedDecisions = new Set([
    "pending",
    "new-page",
    "existing-page",
    "not-a-subsystem",
    "no-candidates",
  ]);
  if (decisions.length === 0) {
    reviewFailures.push("Subsystem review has no Decision field");
  }
  for (const decision of decisions) {
    if (!allowedDecisions.has(decision)) {
      reviewFailures.push(`Subsystem review has invalid decision: ${decision}`);
    }
  }

  const pendingFields = [
    ...text.matchAll(
      /^- (Decision|Documentation|Source confirmation): (?:`pending`|pending)$/gm,
    ),
  ];
  if (pendingFields.length > 0 && !allowPending) {
    reviewFailures.push(
      `Subsystem review has ${pendingFields.length} unresolved field(s); resolve them or use --allow-pending-subsystems for a draft fallback`,
    );
  }

  const candidateMatches = [
    ...text.matchAll(/^## Candidate \d+: `([^`]+)`$/gm),
  ];
  const candidateIds = new Set();
  for (let index = 0; index < candidateMatches.length; index += 1) {
    const match = candidateMatches[index];
    const candidateId = match[1];
    if (candidateIds.has(candidateId)) {
      reviewFailures.push(`Subsystem review repeats candidate: ${candidateId}`);
    }
    candidateIds.add(candidateId);

    const sectionEnd = candidateMatches[index + 1]?.index ?? text.length;
    const section = text.slice(match.index, sectionEnd);
    const decision = section.match(/^- Decision: `([^`]+)`$/m)?.[1];
    const documentation = section.match(/^- Documentation: (.+)$/m)?.[1];
    const sourceConfirmation = section.match(
      /^- Source confirmation: (.+)$/m,
    )?.[1];

    if (!decision) {
      reviewFailures.push(`Candidate ${candidateId} is missing Decision`);
    }
    if (!documentation) {
      reviewFailures.push(`Candidate ${candidateId} is missing Documentation`);
    }
    if (!sourceConfirmation) {
      reviewFailures.push(`Candidate ${candidateId} is missing Source confirmation`);
    }
    if (
      (decision === "new-page" || decision === "existing-page") &&
      documentation &&
      !/\[[^\]]+\]\([^)]+\)/.test(documentation)
    ) {
      reviewFailures.push(
        `Candidate ${candidateId} decision ${decision} requires a Markdown documentation link`,
      );
    }
  }

  if (expectedCandidateIds) {
    const expected = new Set(expectedCandidateIds);
    for (const candidateId of expected) {
      if (!candidateIds.has(candidateId)) {
        reviewFailures.push(
          `Subsystem review is missing generated candidate: ${candidateId}`,
        );
      }
    }
    for (const candidateId of candidateIds) {
      if (!expected.has(candidateId)) {
        reviewFailures.push(
          `Subsystem review contains unknown candidate: ${candidateId}`,
        );
      }
    }
  }

  return { failures: reviewFailures, pendingCount: pendingFields.length };
}

function checkSubsystemReview(allowPending) {
  const reviewPath = join(DOCS_ROOT, SUBSYSTEM_REVIEW);
  if (!existsSync(reviewPath)) {
    failures.push(`Subsystem review is missing: ${SUBSYSTEM_REVIEW}`);
    return;
  }

  const text = readFileSync(reviewPath, "utf8");
  if (!existsSync(SUBSYSTEM_MANIFEST)) {
    failures.push("Generated subsystem candidate manifest is missing");
    return;
  }
  const manifest = JSON.parse(readFileSync(SUBSYSTEM_MANIFEST, "utf8"));
  const expectedCandidateIds = (manifest.candidates ?? []).map(
    (candidate) => candidate.id,
  );
  const result = analyzeSubsystemReview(
    text,
    allowPending,
    expectedCandidateIds,
  );
  failures.push(...result.failures);

  const summary = readFileSync(join(DOCS_ROOT, "SUMMARY.md"), "utf8");
  const astroConfig = readFileSync(
    join(REPO_ROOT, "website", "astro.config.mjs"),
    "utf8",
  );
  const candidateMatches = [
    ...text.matchAll(/^## Candidate \d+: `([^`]+)`$/gm),
  ];
  for (let index = 0; index < candidateMatches.length; index += 1) {
    const match = candidateMatches[index];
    const sectionEnd = candidateMatches[index + 1]?.index ?? text.length;
    const section = text.slice(match.index, sectionEnd);
    const decision = section.match(/^- Decision: `([^`]+)`$/m)?.[1];
    if (decision !== "new-page") continue;

    const documentation = section.match(/^- Documentation: (.+)$/m)?.[1] ?? "";
    const href = documentation.match(/\[[^\]]+\]\(([^)]+)\)/)?.[1];
    if (!href) continue;
    const cleanHref = href.split("#", 1)[0].split("?", 1)[0];
    const target = resolve(dirname(reviewPath), cleanHref);
    const relativeDocPath = relative(DOCS_ROOT, target).replaceAll("\\", "/");
    if (relativeDocPath.startsWith("../") || !relativeDocPath.endsWith(".md")) {
      failures.push(
        `New subsystem candidate ${match[1]} must link to a Markdown page under docs/`,
      );
      continue;
    }
    if (!summary.includes(relativeDocPath)) {
      failures.push(
        `New subsystem page is missing from docs/SUMMARY.md: ${relativeDocPath}`,
      );
    }

    let route = relativeDocPath.slice(0, -".md".length);
    if (route === "README") route = "";
    else if (route.endsWith("/README")) route = route.slice(0, -"/README".length);
    const routeNeedle = route ? `/${route}/` : "/";
    if (!astroConfig.includes(routeNeedle)) {
      failures.push(
        `New subsystem page is missing from the website sidebar: ${routeNeedle}`,
      );
    }
  }

  if (result.pendingCount > 0 && allowPending) {
    console.log(
      `Subsystem review has ${result.pendingCount} pending field(s); draft fallback allowed.`,
    );
  }
}

function checkAtlasCounts() {
  const atlas = JSON.parse(
    readFileSync(join(REPO_ROOT, "source-atlas", "summary.json"), "utf8"),
  );
  const atlasDoc = readFileSync(
    join(DOCS_ROOT, "99-research-atlas", "source-atlas.md"),
    "utf8",
  );
  const expectedCounts = [
    atlas.source.bytes,
    atlas.source.lines,
    atlas.counts.functions,
    atlas.counts.classes,
    atlas.counts.declarationBlocks,
    atlas.counts.envVars,
    atlas.counts.featureKeys,
    atlas.counts.experimentFlagStrings,
    atlas.counts.eventStrings,
    atlas.counts.jsonRpcMethods,
    atlas.counts.confirmedSlashCommands,
    atlas.counts.slashCommandCandidates,
    atlas.counts.knownToolNameHits,
  ];

  for (const count of expectedCounts) {
    const rendered = Number(count).toLocaleString("en-US");
    if (!atlasDoc.includes(`\`${rendered}\``)) {
      failures.push(`Source-atlas documentation is missing count ${rendered}`);
    }
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const markdownFiles = walk(DOCS_ROOT).filter((file) => file.endsWith(".md"));
  checkMarkdownLinks(markdownFiles);
  checkNavigation();
  checkGeneratedRoutes();
  checkSubsystemReview(options.allowPendingSubsystems);
  checkAtlasCounts();

  console.log(`Checked ${markdownFiles.length} Markdown files.`);
  if (failures.length > 0) {
    for (const failure of failures) console.error(failure);
    process.exitCode = 1;
    return;
  }
  console.log("Links, navigation, generated route, H1, and atlas counts are consistent.");
}

if (process.argv[1] && resolve(process.argv[1]) === SCRIPT_PATH) {
  main();
}

export { analyzeSubsystemReview };
