// @ts-check
/**
 * Rehype plugin — turn line-number cells in source-anchor tables into
 * clickable buttons that pop open a snippet of the analyzed `app.js`
 * bundle. Pairs with:
 *   - `scripts/extract-snippets.mjs`     (writes the per-line JSON shards)
 *   - `src/components/SourceAnchorPopup.astro` (renders the popup at runtime)
 *
 * The plugin targets tables whose `<thead>` includes a column whose
 * accessible text matches /\bline\b/i (e.g. "Approx. `app.js` line").
 * For each cell in that column, every integer becomes a
 * `<button class="src-anchor" data-line="N">N</button>`. Comma-separated
 * lists and dash ranges are handled naturally because each integer is
 * matched independently.
 *
 * Applies to every doc page; the snippet extractor walks the same set
 * of files and pre-renders matching JSON shards under `public/snippets/`.
 */

function isElement(node, tag) {
  return Boolean(
    node && node.type === 'element' && node.tagName === tag,
  );
}

/** Concatenate the visible text of a hast node and its descendants. */
function textOf(node) {
  if (!node) return '';
  if (node.type === 'text') return node.value ?? '';
  if (Array.isArray(node.children)) {
    return node.children.map(textOf).join('');
  }
  return '';
}

function findHeaderCells(table) {
  const thead = (table.children ?? []).find((c) => isElement(c, 'thead'));
  if (!thead) return null;
  const tr = (thead.children ?? []).find((c) => isElement(c, 'tr'));
  if (!tr) return null;
  return (tr.children ?? []).filter((c) => isElement(c, 'th'));
}

function findBodyRows(table) {
  const tbody = (table.children ?? []).find((c) => isElement(c, 'tbody'));
  if (!tbody) return [];
  return (tbody.children ?? []).filter((c) => isElement(c, 'tr'));
}

/**
 * Replace the cell's text content with a mix of text nodes and button
 * elements: every contiguous run of digits becomes a clickable button.
 */
function rebuildCellChildren(cellText) {
  const out = [];
  const re = /\d+/g;
  let last = 0;
  let m;
  while ((m = re.exec(cellText)) !== null) {
    if (m.index > last) {
      out.push({ type: 'text', value: cellText.slice(last, m.index) });
    }
    const n = m[0];
    out.push({
      type: 'element',
      tagName: 'button',
      properties: {
        type: 'button',
        className: ['src-anchor'],
        'data-line': n,
        title: `Show app.js line ${n}`,
      },
      children: [{ type: 'text', value: n }],
    });
    last = m.index + n.length;
  }
  if (last < cellText.length) {
    out.push({ type: 'text', value: cellText.slice(last) });
  }
  return out;
}

function walk(node, visit) {
  if (!node) return;
  if (node.type === 'element') visit(node);
  if (Array.isArray(node.children)) {
    for (const child of node.children) walk(child, visit);
  }
}

export default function rehypeSourceAnchors() {
  return function transformer(tree) {
    walk(tree, (node) => {
      if (!isElement(node, 'table')) return;
      const headerCells = findHeaderCells(node);
      if (!headerCells || headerCells.length === 0) return;
      const lineColIdx = headerCells.findIndex((th) =>
        /\bline\b/i.test(textOf(th)),
      );
      if (lineColIdx === -1) return;

      for (const tr of findBodyRows(node)) {
        const cells = (tr.children ?? []).filter((c) => isElement(c, 'td'));
        const cell = cells[lineColIdx];
        if (!cell) continue;
        const text = textOf(cell);
        if (!/\d/.test(text)) continue;
        cell.children = rebuildCellChildren(text);
      }
    });
  };
}
