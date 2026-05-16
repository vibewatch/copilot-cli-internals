# Validation and Reporting

Use this reference before finishing any reverse-engineering task.

## Validate Source Atlas Work

If the atlas generator was touched or used, validate it from the repository root:

```sh
node --check scripts/index-app-js.mjs
node scripts/index-app-js.mjs
```

For incremental mode, inspect `git diff -- source-atlas` before and after documentation edits so the final summary can distinguish generated baseline changes from hand-written docs changes.

## Validate Docs Work

When docs changed, build the site from the repository root context:

```sh
cd website
npm run build
```

If terminal state may be unknown, use an absolute repository path before changing into `website/`. In zsh, avoid assigning to the readonly variable `status`; use a variable such as `rc` instead.

Then verify:

- Markdown page count is expected.
- The build completes successfully.
- Warnings are understood and unrelated.
- Git status contains only intended docs, atlas, or skill changes.
- New files are accounted for, including untracked files that `git diff --stat` omits.

## Report Completion

Summarize:

- Selected mode: full or incremental.
- Target call path, docs gap, or package delta.
- Key `source-atlas/` deltas if incremental, and whether they are docs-relevant.
- Files created or changed.
- Key source anchors used.
- Validation result.
- Remaining candidate gaps, if any.

Keep the summary concise and avoid pasting large docs content unless requested.

## Quality Checklist

- [ ] Mode was selected: full analysis or incremental `source-atlas/` analysis.
- [ ] If incremental, `source-atlas/` baseline status and diff were checked before deep source reads.
- [ ] Existing docs were checked first.
- [ ] At least one source anchor directly supports each major claim.
- [ ] Minified aliases and semantic names are both recorded.
- [ ] Duplicate documentation was avoided.
- [ ] `source-atlas/` was regenerated or intentionally left untouched, and that choice is reported.
- [ ] New pages are linked from the appropriate index and summary files.
- [ ] Backlog/counts were updated when applicable.
- [ ] Website build succeeded or any failure is explained with next steps.
- [ ] Final summary includes files changed and validation status.

## Common Pitfalls

- Broad bundle search: search for specific aliases, API names, and event names instead.
- Schema-only conclusions: confirm implementation in `app.js` or adjacent SDK code.
- Line-number overprecision: use approximate lines plus symbol names.
- Doc duplication: extend or cross-link existing pages instead of creating parallel explanations.
- Atlas diff overclaiming: confirm runtime behavior before documenting a change.
- Accidental baseline overwrite: check Git status before regenerating `source-atlas/`; use `source-atlas-next/` for non-destructive comparison when unsure.
- Declaration diff noise: prioritize surface strings and semantic anchors before raw declaration-count changes.
- Untracked file blindness: `git diff --stat` omits new untracked pages; check status explicitly.
- Terminal directory drift: previous commands may leave the shell inside `website/`; use absolute paths when validating.