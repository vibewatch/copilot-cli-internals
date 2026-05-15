// @ts-check
/**
 * Rewrite GitHub-flavored markdown links to Starlight routes.
 *
 * The source docs in `../docs/` use relative `.md` references that work on
 * GitHub but produce broken anchors after Astro renders them to HTML
 * (the deployed routes don't include the `.md` suffix). This rehype plugin
 * walks anchor elements and normalizes their `href` so that:
 *
 *   ./README.md         -> ./
 *   ../README.md        -> ../
 *   ./SUMMARY.md        -> ./summary/      (rendered as a top-level page)
 *   ../SUMMARY.md       -> ../summary/
 *   ../foo/bar.md       -> ../foo/bar/
 *   ../foo/bar.md#x     -> ../foo/bar/#x
 *   ./quux.mdx          -> ./quux/
 *
 * Absolute URLs, in-page anchors, mailto links, and non-`.md` paths are
 * left untouched. The output trailing slash matches Astro's
 * `trailingSlash: 'always'` setting.
 */

/** Walk every `element` node in a hast tree. */
function walk(node, visit) {
  if (!node) return;
  if (node.type === 'element') visit(node);
  if (Array.isArray(node.children)) {
    for (const child of node.children) walk(child, visit);
  }
}

/** Convert a single href; return the original value when no change applies. */
function rewriteHref(href) {
  if (typeof href !== 'string' || href.length === 0) return href;
  // Skip absolute URLs (http:, https:, mailto:, tel:, data:, //example.com, …).
  if (/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(href)) return href;
  // Pure in-page anchors stay as-is.
  if (href.startsWith('#')) return href;

  const hashIndex = href.indexOf('#');
  const pathPart = hashIndex === -1 ? href : href.slice(0, hashIndex);
  const hashPart = hashIndex === -1 ? '' : href.slice(hashIndex);

  if (!/\.mdx?$/i.test(pathPart)) return href;

  let p = pathPart.replace(/\.mdx?$/i, '');
  // README collapses to the containing directory's index page (by design).
  p = p.replace(/(^|\/)README$/i, '$1');
  // SUMMARY.md is rendered at /summary/, so map any-case SUMMARY to lowercase.
  p = p.replace(/(^|\/)SUMMARY$/i, '$1summary');

  // Ensure a trailing slash so links work with `trailingSlash: 'always'`.
  if (p !== '' && !p.endsWith('/')) p = `${p}/`;

  return `${p}${hashPart}`;
}

/** rehype plugin factory. */
export default function rehypeRewriteDocLinks() {
  return function transformer(tree) {
    walk(tree, (node) => {
      if (node.tagName !== 'a' || !node.properties) return;
      const href = node.properties.href;
      const next = rewriteHref(href);
      if (next !== href) node.properties.href = next;
    });
  };
}
