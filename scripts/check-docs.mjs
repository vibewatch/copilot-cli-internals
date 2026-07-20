#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DOCS_ROOT = join(REPO_ROOT, "docs");
const LATEST_REPORT = "00-start-here/latest-package-update.md";
const LATEST_ROUTE = "00-start-here/latest-package-update";
const failures = [];

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
}

function checkGeneratedRoute() {
  const route = join(REPO_ROOT, "website", "dist", LATEST_ROUTE, "index.html");
  if (!existsSync(route)) {
    failures.push(`Generated route is missing: ${relative(REPO_ROOT, route)}`);
    return;
  }

  const html = readFileSync(route, "utf8");
  const h1Count = (html.match(/<h1\b/g) ?? []).length;
  if (h1Count !== 1) {
    failures.push(`Generated latest-package route has ${h1Count} H1 elements`);
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
  const markdownFiles = walk(DOCS_ROOT).filter((file) => file.endsWith(".md"));
  checkMarkdownLinks(markdownFiles);
  checkNavigation();
  checkGeneratedRoute();
  checkAtlasCounts();

  console.log(`Checked ${markdownFiles.length} Markdown files.`);
  if (failures.length > 0) {
    for (const failure of failures) console.error(failure);
    process.exitCode = 1;
    return;
  }
  console.log("Links, navigation, generated route, H1, and atlas counts are consistent.");
}

main();
