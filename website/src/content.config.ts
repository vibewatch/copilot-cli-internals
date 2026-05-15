import { defineCollection } from 'astro:content';
import type { Loader } from 'astro/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Read documentation directly from `../docs/` — the workspace-root markdown
 * tree is the single source of truth, no copy or symlink required.
 *
 * The source files don't carry a YAML `title` frontmatter; they use a
 * markdown H1 as the title. Starlight's schema requires `title`, so this
 * loader injects one derived from the first H1 if none is present, leaving
 * the on-disk content untouched.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
/** Absolute path to the docs/ tree (used for filesystem reads). */
const DOCS_ROOT = path.resolve(here, '..', '..', 'docs');
/** Path used in filePath fields — Astro requires it relative to the site root. */
const SITE_ROOT = path.resolve(here, '..');

/** Files we never want to surface as routes (GitBook-style TOC duplicates). */
const EXCLUDE_BASENAMES = new Set(['SUMMARY.md']);

/**
 * Map an on-disk relative path to a Starlight slug.
 *   README.md                        -> "index"          (the home page)
 *   00-overview/README.md            -> "00-overview"
 *   00-overview/what-is-app-js.md    -> "00-overview/what-is-app-js"
 */
function deriveId(relPath: string): string {
  let id = relPath.replace(/\\/g, '/').replace(/\.mdx?$/i, '');
  // Folder README acts as the folder index.
  id = id.replace(/(^|\/)README$/i, '$1');
  id = id.replace(/\/$/, '');
  // Root README has no folder context — use "index" (Astro requires non-empty IDs).
  return id === '' ? 'index' : id;
}

/** Minimal YAML frontmatter parser — handles `key: value` lines only. */
function parseFrontmatter(raw: string): {
  data: Record<string, unknown>;
  body: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]+?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };
  const data: Record<string, unknown> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) data[kv[1]] = kv[2].replace(/^["']|["']$/g, '').trim();
  }
  return { data, body: match[2] };
}

/** Pull the first ATX H1 ("# Heading") out of a markdown body. */
function extractH1(body: string): string | null {
  const m = body.match(/^#\s+(.+?)\s*#*\s*$/m);
  if (!m) return null;
  return m[1].replace(/`/g, '').trim();
}

/** Recursively collect all `.md`/`.mdx` files under a directory. */
async function collect(dir: string, prefix = ''): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const out: string[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      out.push(...(await collect(full, rel)));
    } else if (
      /\.(md|mdx)$/i.test(entry.name) &&
      !EXCLUDE_BASENAMES.has(entry.name)
    ) {
      out.push(rel);
    }
  }
  return out;
}

function docsFromWorkspaceRoot(): Loader {
  return {
    name: 'docs-from-workspace-root',
    async load({ store, parseData, generateDigest, watcher, logger, config }) {
      store.clear();
      const files = await collect(DOCS_ROOT);
      logger.info(`Loading ${files.length} doc page(s) from ${DOCS_ROOT}`);

      // Build a markdown processor that mirrors Astro's user config so the
      // rendered HTML matches what the default `glob()` loader would produce
      // (GFM tables, footnotes, syntax-highlighted fences, etc.).
      const processor = await createMarkdownProcessor(config.markdown);

      for (const rel of files) {
        const full = path.join(DOCS_ROOT, rel);
        const relToSite = path.relative(SITE_ROOT, full);
        const raw = await fs.readFile(full, 'utf8');
        const { data, body } = parseFrontmatter(raw);

        if (!data.title) {
          const h1 = extractH1(body);
          data.title = h1 ?? path.basename(rel, path.extname(rel));
        }

        const id = deriveId(rel);
        const parsed = await parseData({ id, data, filePath: relToSite });
        const rendered = await processor.render(body, {
          frontmatter: parsed,
          fileURL: new URL(`file://${full}`),
        });

        store.set({
          id,
          data: parsed,
          body,
          filePath: relToSite,
          digest: generateDigest(raw),
          rendered: {
            html: rendered.code,
            metadata: {
              headings: rendered.metadata.headings,
              imagePaths: [
                ...(rendered.metadata.localImagePaths ?? []),
                ...(rendered.metadata.remoteImagePaths ?? []),
              ],
              frontmatter: parsed,
            },
          },
        });
      }

      if (watcher) {
        watcher.add(DOCS_ROOT);
      }
    },
  };
}

export const collections = {
  docs: defineCollection({
    loader: docsFromWorkspaceRoot(),
    schema: docsSchema(),
  }),
};
