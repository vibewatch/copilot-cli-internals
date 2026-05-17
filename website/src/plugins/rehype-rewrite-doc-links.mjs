// @ts-check
import fs from 'node:fs';
import path from 'node:path';

/**
 * Rewrite GitHub-flavored markdown links to website-safe links.
 *
 * The source docs in `../docs/` use file-relative links that work on GitHub,
 * but Starlight renders each non-index markdown file as a directory URL:
 *
 *   docs/00-start-here/main-feature-map.md -> /00-start-here/main-feature-map/
 *
 * That means a GitHub-valid sibling link such as `what-is-app-js.md` must become
 * `../what-is-app-js/` on the website, not `what-is-app-js/`. This plugin uses
 * the current markdown file path from the VFile to normalize docs links against
 * the rendered route graph.
 *
 * Links from docs pages to repository artifacts outside `docs/` are not served
 * by the static Starlight site, so they are rewritten to GitHub blob/tree URLs.
 *
 * Absolute URLs, in-page anchors, mailto links, root-relative site links, and
 * unknown/nonexistent local targets are left untouched.
 */

const DEFAULT_REPOSITORY_URL = 'https://github.com/vibewatch/copilot-cli-internals';
const REPOSITORY_URL = (process.env.PUBLIC_REPOSITORY_URL ?? DEFAULT_REPOSITORY_URL).replace(/\/$/, '');
const REPOSITORY_BRANCH = process.env.PUBLIC_REPOSITORY_BRANCH ?? 'main';

/**
 * @typedef {object} HastNode
 * @property {string} [type]
 * @property {string} [tagName]
 * @property {Record<string, unknown>} [properties]
 * @property {HastNode[]} [children]
 */

/**
 * @typedef {object} VFileLike
 * @property {string} [cwd]
 * @property {string} [path]
 */

/** @typedef {(node: HastNode) => void} NodeVisitor */

/**
 * Walk every `element` node in a hast tree.
 *
 * @param {HastNode | null | undefined} node
 * @param {NodeVisitor} visit
 * @returns {void}
 */
function walk(node, visit) {
  if (!node) return;
  if (node.type === 'element') visit(node);
  if (Array.isArray(node.children)) {
    for (const child of node.children) walk(child, visit);
  }
}

/**
 * Normalize a filesystem path to POSIX separators for route generation.
 *
 * @param {string} value
 * @returns {string}
 */
function toPosixPath(value) {
  return value.replace(/\\/g, '/');
}

/**
 * Return true when `target` is inside `root` or exactly `root`.
 *
 * @param {string} root
 * @param {string} target
 * @returns {boolean}
 */
function isInsidePath(root, target) {
  const rel = path.relative(root, target);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

/**
 * Split a local URL into pathname and query/hash suffix.
 *
 * @param {string} href
 * @returns {{ pathPart: string, suffix: string }}
 */
function splitHref(href) {
  const match = href.match(/^([^?#]*)([?#].*)?$/);
  return {
    pathPart: match?.[1] ?? href,
    suffix: match?.[2] ?? '',
  };
}

/**
 * Resolve the documentation root used by `src/content.config.ts`.
 *
 * @param {VFileLike | null | undefined} file
 * @returns {string}
 */
function getDocsRoot(file) {
  return path.resolve(file?.cwd ?? process.cwd(), '..', 'docs');
}

/**
 * Map an on-disk docs-relative markdown path to a Starlight route.
 *
 * @param {string} relPath
 * @returns {string}
 */
function deriveDocRoute(relPath) {
  let id = toPosixPath(relPath).replace(/\.mdx?$/i, '');
  // Folder README acts as the folder index.
  id = id.replace(/(^|\/)README$/i, '$1');
  // Root SUMMARY becomes a lowercase top-level page.
  id = id.replace(/^SUMMARY$/, 'summary');
  id = id.replace(/\/$/, '');
  return id === '' ? '/' : `/${id}/`;
}

/**
 * Convert an absolute target route to a relative link from the source route.
 *
 * @param {string} sourceRoute
 * @param {string} targetRoute
 * @returns {string}
 */
function relativeRouteHref(sourceRoute, targetRoute) {
  let rel = path.posix.relative(sourceRoute, targetRoute);
  if (rel === '') rel = '.';
  if (!rel.endsWith('/')) rel = `${rel}/`;
  return rel;
}

/**
 * Resolve a docs target that may point to a markdown file or a README folder.
 *
 * @param {string} targetPath
 * @returns {string | null}
 */
function resolveDocsTarget(targetPath) {
  if (/\.mdx?$/i.test(targetPath)) return targetPath;
  try {
    if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
      const readmePath = path.join(targetPath, 'README.md');
      if (fs.existsSync(readmePath)) return readmePath;
    }
  } catch {
    // Leave unknown targets unchanged below.
  }
  return null;
}

/**
 * Convert a repository-local target outside docs to a GitHub blob/tree URL.
 *
 * @param {string} repoRoot
 * @param {string} targetPath
 * @returns {string | null}
 */
function repositoryUrlForTarget(repoRoot, targetPath) {
  if (!isInsidePath(repoRoot, targetPath) || !fs.existsSync(targetPath)) return null;

  const rel = toPosixPath(path.relative(repoRoot, targetPath));
  const encodedRel = rel.split('/').map(encodeURIComponent).join('/');
  const kind = fs.statSync(targetPath).isDirectory() ? 'tree' : 'blob';
  return `${REPOSITORY_URL}/${kind}/${REPOSITORY_BRANCH}/${encodedRel}`;
}

/**
 * Legacy fallback for processors that do not provide VFile path context.
 *
 * @param {string} pathPart
 * @returns {string | null}
 */
function rewriteMarkdownHrefWithoutFileContext(pathPart) {
  if (!/\.mdx?$/i.test(pathPart)) return null;

  let p = pathPart.replace(/\.mdx?$/i, '');
  p = p.replace(/(^|\/)README$/i, '$1');
  p = p.replace(/(^|\/)SUMMARY$/i, '$1summary');
  if (p !== '' && !p.endsWith('/')) p = `${p}/`;
  return p;
}

/**
 * Convert a single href; return the original value when no change applies.
 *
 * @param {unknown} href
 * @param {VFileLike | null | undefined} file
 * @returns {unknown}
 */
function rewriteHref(href, file) {
  if (typeof href !== 'string' || href.length === 0) return href;
  // Skip absolute URLs (http:, https:, mailto:, tel:, data:, //example.com, …).
  if (/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(href)) return href;
  // Pure in-page anchors stay as-is.
  if (href.startsWith('#')) return href;

  const { pathPart, suffix } = splitHref(href);
  if (!pathPart || pathPart.startsWith('/')) return href;

  if (!file?.path || !path.isAbsolute(file.path)) {
    const fallback = rewriteMarkdownHrefWithoutFileContext(pathPart);
    return fallback === null ? href : `${fallback}${suffix}`;
  }

  const docsRoot = getDocsRoot(file);
  const repoRoot = path.resolve(docsRoot, '..');
  const sourcePath = path.resolve(file.path);
  const targetPath = path.resolve(path.dirname(sourcePath), pathPart);

  if (isInsidePath(docsRoot, targetPath)) {
    const targetDocPath = resolveDocsTarget(targetPath);
    if (!targetDocPath) return href;

    const sourceRoute = deriveDocRoute(path.relative(docsRoot, sourcePath));
    const targetRoute = deriveDocRoute(path.relative(docsRoot, targetDocPath));
    return `${relativeRouteHref(sourceRoute, targetRoute)}${suffix}`;
  }

  const repositoryUrl = repositoryUrlForTarget(repoRoot, targetPath);
  return repositoryUrl === null ? href : `${repositoryUrl}${suffix}`;
}

/**
 * rehype plugin factory.
 *
 * @returns {(tree: HastNode, file?: VFileLike) => void}
 */
export default function rehypeRewriteDocLinks() {
  return function transformer(tree, file) {
    walk(tree, (node) => {
      if (node.tagName !== 'a' || !node.properties) return;
      const href = node.properties.href;
      const next = rewriteHref(href, file);
      if (next !== href) node.properties.href = next;
    });
  };
}
