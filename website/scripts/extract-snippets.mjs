#!/usr/bin/env node
// @ts-check
/**
 * Build-time snippet extractor for the source-anchor popup.
 *
 * Walks every Markdown file under `docs/`, picks up table cells under
 * the "Approx. `app.js` line" column, and writes one JSON shard per
 * referenced line into `website/public/snippets/L{N}.json`. The shards
 * are fetched lazily by the in-page popup (see
 * `src/components/SourceAnchorPopup.astro`), so the wiki keeps its
 * page weight at zero until a reader actually clicks an anchor.
 *
 * Why per-line shards?
 *   - The bundled `app.js` is ~12 MB on a single line near the largest
 *     module wrappers (some lines are >300 KB). Serving the whole file
 *     to every visitor is unacceptable.
 *   - Per-line JSON files are cacheable, easy to invalidate, and
 *     individually small (<= MAX_LINE_CHARS per shard plus a couple of
 *     context lines).
 *
 * Each shard is rendered from a *pretty-printed* copy of `app.js` so
 * minified module wrappers become readable. Because per-line Prettier
 * doesn't work on a bundle that uses backtick template literals across
 * physical lines, we format the whole file once (cached on disk) and
 * locate each referenced line via a needle search.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createShikiHighlighter } from '@astrojs/markdown-remark';
import * as prettier from 'prettier';

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(here, '..', '..');
const APP_JS = path.join(REPO_ROOT, 'copilot-cli-pkg', 'app.js');
const SNIPPETS_DIR = path.resolve(here, '..', 'public', 'snippets');
const CACHE_DIR = path.resolve(here, '..', '.cache');
const CACHE_JS = path.join(CACHE_DIR, 'app.formatted.js');
const CACHE_META = path.join(CACHE_DIR, 'app.formatted.meta.json');
/** Bump when the formatting pipeline changes; invalidates older caches. */
const CACHE_VERSION = 1;

/**
 * Single Shiki highlighter shared across every shard. We use the same
 * dual-theme pair Starlight uses for its own code blocks so the popup
 * blends in with the rest of the site.
 */
let highlighterPromise;
function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createShikiHighlighter({
      themes: { light: 'github-light', dark: 'github-dark' },
      langs: ['javascript'],
    });
  }
  return highlighterPromise;
}

/**
 * A Shiki transformer that wraps each rendered `<span class="line">` in
 *   `<span class="src-anchor-lineno">N</span>` + `<span class="src-anchor-linecode">…</span>`
 * and tags the requested line with a `line--hit` class so the popup CSS
 * can highlight it. We compute the original file line as
 *   startLine + (rendered-line-index - 1).
 */
function createLineNumberTransformer(startLine, hitLine) {
  return {
    name: 'src-anchor:line-numbers',
    line(node, line) {
      const fileLine = startLine + line - 1;
      const existingClass = node.properties?.class ?? '';
      // hitLine is null when we render Prettier-formatted output: the
      // entire snippet *is* the requested line, so a single highlight
      // band would just shade everything.
      if (hitLine !== null && fileLine === hitLine) {
        node.properties.class = `${existingClass} line--hit`.trim();
      }
      const codeContent = {
        type: 'element',
        tagName: 'span',
        properties: { class: 'src-anchor-linecode' },
        children: node.children,
      };
      node.children = [
        {
          type: 'element',
          tagName: 'span',
          properties: { class: 'src-anchor-lineno' },
          children: [{ type: 'text', value: String(fileLine) }],
        },
        codeContent,
      ];
    },
  };
}

/**
 * Highlight a snippet of JavaScript and return the resulting HTML
 * (including the outer `<pre class="shiki ...">` wrapper). Falls back to
 * an escaped `<pre>` block if Shiki throws (e.g. on unsupported syntax).
 */
async function highlightSnippet(text, startLine, hitLine) {
  try {
    const highlighter = await getHighlighter();
    return highlighter.codeToHtml(text, 'javascript', {
      defaultColor: false,
      transformers: [createLineNumberTransformer(startLine, hitLine)],
    });
  } catch (err) {
    console.warn(`extract-snippets: shiki failed for line ${hitLine}: ${err.message}`);
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<pre class="src-anchor-fallback"><code>${escaped}</code></pre>`;
  }
}

/** Root of the source-doc tree we scan for `app.js` line references. */
const DOCS_ROOT = path.join(REPO_ROOT, 'docs');

/**
 * Recursively collect every Markdown file under `DOCS_ROOT`. Symbolic
 * links are followed via `fs.readdir({ withFileTypes: true })`'s
 * default behaviour, which is fine for our flat docs tree.
 */
async function collectDocFiles(root) {
  const out = [];
  async function walkDir(dir) {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch (err) {
      console.warn(`extract-snippets: cannot read ${dir} (${err.message}); skipping.`);
      return;
    }
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        await walkDir(full);
      } else if (ent.isFile() && /\.md$/i.test(ent.name)) {
        out.push(full);
      }
    }
  }
  await walkDir(root);
  return out;
}

/**
 * Hard cap on raw characters per line emitted to a shard. The bundled
 * `app.js` packs entire esbuild module wrappers onto a single line, so
 * a few referenced "lines" weigh hundreds of kilobytes. Truncating at
 * 12 K keeps the popup responsive — readers who need the full module
 * follow the github.dev link in the popup footer.
 */
const MAX_LINE_CHARS = 12_000;

/** How many lines of context to ship before/after the requested line
 * when we have a formatted-file match. Larger than the raw-fallback
 * radius because formatted lines are short (<= 80 chars) so a wider
 * window still fits comfortably in the popup. */
const CONTEXT_RADIUS_FORMATTED = 15;

/** Fallback radius used when we couldn't locate the line in the
 * formatted output and have to show the raw bundle text. */
const CONTEXT_RADIUS_RAW = 2;

/** Reasonable upper bound on a referenced line number, so a stray "8090-8130"
 *  range that overflows past the file just gets clamped without warnings. */
function clampLine(n, total) {
  if (!Number.isFinite(n)) return null;
  if (n < 1 || n > total) return null;
  return n;
}

/**
 * Try to pretty-print a chunk of bundle JavaScript. We use the babel
 * parser because it accepts the broadest superset of modern JS syntax
 * (decorators, optional chaining, top-level await, ...).
 *
 * Returns `{ ok: true, code }` on success; `{ ok: false }` on failure so
 * the caller can fall back to the raw view.
 */
async function formatJs(code) {
  try {
    const out = await prettier.format(code, {
      parser: 'babel',
      semi: true,
      printWidth: 80,
      tabWidth: 2,
      singleQuote: false,
      trailingComma: 'all',
    });
    return { ok: true, code: out.trimEnd() };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Format the entire `app.js` once and cache the result on disk. The
 * cache is keyed on the source file's size + mtime + a version number,
 * so the expensive Prettier run (~20 s on a 12 MB bundle) only happens
 * when `app.js` actually changes. Returns the formatted source text.
 *
 * Individual `app.js` lines can't be Prettier-formatted in isolation
 * because the bundle uses backtick template literals that span many
 * physical lines, so a single line is usually a syntactic fragment.
 * Whole-file formatting sidesteps that problem.
 */
async function loadFormattedAppSrc(rawSrc, srcStat) {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  const wantedKey = {
    version: CACHE_VERSION,
    size: srcStat.size,
    mtimeMs: Math.floor(srcStat.mtimeMs),
  };
  try {
    const meta = JSON.parse(await fs.readFile(CACHE_META, 'utf8'));
    if (
      meta.version === wantedKey.version &&
      meta.size === wantedKey.size &&
      meta.mtimeMs === wantedKey.mtimeMs
    ) {
      return await fs.readFile(CACHE_JS, 'utf8');
    }
  } catch {
    // Cache miss — fall through to format.
  }
  const t0 = Date.now();
  const result = await formatJs(rawSrc);
  if (!result.ok) {
    throw new Error(
      `extract-snippets: prettier failed on app.js: ${result.error}`,
    );
  }
  await fs.writeFile(CACHE_JS, result.code);
  await fs.writeFile(CACHE_META, JSON.stringify(wantedKey, null, 2));
  console.log(
    `extract-snippets: formatted app.js in ${((Date.now() - t0) / 1000).toFixed(1)}s ` +
      `(${rawSrc.length.toLocaleString()} → ${result.code.length.toLocaleString()} chars), cached at ${path.relative(REPO_ROOT, CACHE_JS)}`,
  );
  return result.code;
}

/**
 * Pick a substring from `lineText` that uniquely (or at least
 * unambiguously) identifies its location in `formattedSrc`. We try a
 * series of candidates — prefixes of varying lengths and interior
 * sliding windows — because lines in `app.js` are often syntactic
 * fragments that only partially survive Prettier's reformatting.
 *
 * Returns `{ idx, count }` where `idx` is the first match offset in
 * `formattedSrc` (or `-1` if no candidate matched). `count` is the
 * total number of matches for the chosen candidate (1 = unique).
 */
function findInFormatted(lineText, formattedSrc) {
  const candidates = [];
  const stripped = lineText.replace(/^\s+/, '');
  for (const L of [120, 90, 60, 45]) {
    if (lineText.length >= L) candidates.push(lineText.slice(0, L));
    if (stripped.length >= L && stripped !== lineText) {
      candidates.push(stripped.slice(0, L));
    }
  }
  if (lineText.length > 80) {
    for (let off = 15; off + 60 <= lineText.length; off += 15) {
      candidates.push(lineText.slice(off, off + 60));
    }
  }
  if (lineText.length <= 120 && lineText.length >= 10) candidates.push(lineText);
  if (
    stripped.length <= 120 &&
    stripped.length >= 10 &&
    stripped !== lineText
  ) {
    candidates.push(stripped);
  }

  let best = { idx: -1, count: Infinity };
  for (const cand of candidates) {
    if (!/\S{8,}/.test(cand)) continue;
    let count = 0;
    let pos = 0;
    let firstIdx = -1;
    while ((pos = formattedSrc.indexOf(cand, pos)) !== -1) {
      if (firstIdx === -1) firstIdx = pos;
      count++;
      pos++;
      if (count > 5) break;
    }
    if (count >= 1 && count < best.count) {
      best = { idx: firstIdx, count };
    }
    if (count === 1) break; // Can't do better than a unique match.
  }
  return best;
}

/**
 * Convert a byte offset into a 1-based line number for `text`. Used to
 * locate the formatted line that contains the needle match.
 */
function offsetToLine(text, offset) {
  let line = 1;
  for (let i = 0; i < offset; i++) {
    if (text.charCodeAt(i) === 10 /* \n */) line++;
  }
  return line;
}

/**
 * Walk a markdown source and pick up every integer that lives in a
 * table cell whose column header matches /\bline\b/i. Handles single
 * numbers (`1144`), comma lists (`1340, 555`) and ranges (`8090-8130`).
 */
function extractLineNumbers(markdown) {
  const lines = markdown.split(/\r?\n/);
  /** @type {Set<number>} */
  const nums = new Set();
  let lineColIndex = -1;
  let pendingHeader = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line.startsWith('|')) {
      // Non-table line ends any in-progress table.
      lineColIndex = -1;
      pendingHeader = false;
      continue;
    }

    const cells = line
      .replace(/^\||\|$/g, '')
      .split('|')
      .map((c) => c.trim());

    const isSepRow = cells.every((c) => /^:?-+:?$/.test(c));
    if (isSepRow) {
      // The row right after the header confirms the table; nothing to do here.
      pendingHeader = false;
      continue;
    }

    if (lineColIndex === -1) {
      // Treat this as a candidate header row.
      const headerIdx = cells.findIndex((c) => /\bline\b/i.test(c));
      if (headerIdx !== -1) {
        lineColIndex = headerIdx;
        pendingHeader = true;
      }
      continue;
    }

    if (pendingHeader) {
      // We expected a separator row; this row isn't it, so the prior row
      // wasn't actually a header. Reset and try again.
      lineColIndex = -1;
      pendingHeader = false;
      continue;
    }

    const cellText = cells[lineColIndex] ?? '';
    const ints = cellText.match(/\d+/g) ?? [];
    for (const n of ints) nums.add(Number(n));
  }

  return nums;
}

async function main() {
  let appSrc;
  let appStat;
  try {
    appSrc = await fs.readFile(APP_JS, 'utf8');
    appStat = await fs.stat(APP_JS);
  } catch (err) {
    console.warn(
      `extract-snippets: cannot read ${path.relative(REPO_ROOT, APP_JS)} (${err.message}); skipping.`,
    );
    return;
  }

  // Splitting on '\n' (not the regex variant) keeps line indices aligned
  // with the way `wc -l` counts the file.
  const allLines = appSrc.split('\n');
  const totalLines = allLines.length;

  // Format the bundle once (cached on disk) so per-line shards can lift
  // a readable window out of the formatted output.
  let formattedSrc = null;
  let formattedLines = null;
  try {
    formattedSrc = await loadFormattedAppSrc(appSrc, appStat);
    formattedLines = formattedSrc.split('\n');
  } catch (err) {
    console.warn(`extract-snippets: ${err.message}`);
    console.warn('extract-snippets: shards will fall back to raw bundle text.');
  }

  /** @type {Set<number>} */
  const allNums = new Set();
  const docFiles = await collectDocFiles(DOCS_ROOT);
  for (const docPath of docFiles) {
    let md;
    try {
      md = await fs.readFile(docPath, 'utf8');
    } catch (err) {
      console.warn(
        `extract-snippets: cannot read ${path.relative(REPO_ROOT, docPath)} (${err.message}); skipping doc.`,
      );
      continue;
    }
    const nums = extractLineNumbers(md);
    for (const n of nums) {
      const c = clampLine(n, totalLines);
      if (c !== null) allNums.add(c);
    }
  }
  console.log(
    `extract-snippets: scanned ${docFiles.length} doc file(s), found ${allNums.size} unique line reference(s).`,
  );

  await fs.mkdir(SNIPPETS_DIR, { recursive: true });

  // Sweep stale shards from previous runs so a doc edit can shrink the set.
  for (const f of await fs.readdir(SNIPPETS_DIR).catch(() => [])) {
    if (/^L\d+\.json$/.test(f)) {
      await fs.unlink(path.join(SNIPPETS_DIR, f));
    }
  }

  let formattedHits = 0;
  let rawFallbacks = 0;
  for (const n of allNums) {
    const raw = allLines[n - 1] ?? '';
    const truncated = raw.length > MAX_LINE_CHARS;

    let html;
    let formatted = false;
    let startLine;
    let endLine;
    let matchCount = 0;

    // Try the formatted-file path first.
    if (formattedSrc && formattedLines && raw.trim().length > 0) {
      const match = findInFormatted(raw, formattedSrc);
      if (match.idx !== -1) {
        const hitInFormatted = offsetToLine(formattedSrc, match.idx);
        const wStart = Math.max(1, hitInFormatted - CONTEXT_RADIUS_FORMATTED);
        const wEnd = Math.min(
          formattedLines.length,
          hitInFormatted + CONTEXT_RADIUS_FORMATTED,
        );
        const window = formattedLines.slice(wStart - 1, wEnd).join('\n');
        html = await highlightSnippet(window, wStart, hitInFormatted);
        formatted = true;
        startLine = wStart;
        endLine = wEnd;
        matchCount = match.count;
        formattedHits++;
      }
    }

    if (!formatted) {
      // Raw fallback: same as the previous behaviour — show a small
      // slice of original bundle text with the file's true line numbers.
      const beforeStart = Math.max(1, n - CONTEXT_RADIUS_RAW);
      const before = [];
      for (let i = beforeStart; i < n; i++) {
        before.push(allLines[i - 1] ?? '');
      }
      const after = [];
      for (let i = n + 1; i <= Math.min(totalLines, n + CONTEXT_RADIUS_RAW); i++) {
        after.push(allLines[i - 1] ?? '');
      }
      const content = truncated
        ? `${raw.slice(0, MAX_LINE_CHARS)}\n/* … truncated, original line is ${raw.length.toLocaleString()} characters … */`
        : raw;
      const text = [...before, content, ...after].join('\n');
      startLine = beforeStart;
      endLine = beforeStart + before.length + 1 + after.length - 1;
      html = await highlightSnippet(text, beforeStart, n);
      rawFallbacks++;
    }

    const shard = {
      file: 'copilot-cli-pkg/app.js',
      line: n,
      length: raw.length,
      truncated,
      formatted,
      matchCount,
      startLine,
      endLine,
      html,
    };

    await fs.writeFile(
      path.join(SNIPPETS_DIR, `L${n}.json`),
      JSON.stringify(shard),
    );
  }

  console.log(
    `extract-snippets: ${formattedHits} formatted, ${rawFallbacks} raw fallback (of ${allNums.size}).`,
  );

  console.log(
    `extract-snippets: wrote ${allNums.size} shard(s) to ${path.relative(REPO_ROOT, SNIPPETS_DIR)}/`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
