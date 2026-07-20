Update this repository's hand-written Copilot CLI internals documentation for the package version that has already been extracted into copilot-cli-pkg/. You are running through a separately installed native Copilot CLI; treat copilot-cli-pkg/ only as analysis evidence and do not execute its app.js.

Start by reading:
- .agents/skills/reverse-engineering/SKILL.md
- docs/00-start-here/latest-package-update.md
- docs/00-start-here/latest-subsystem-review.md
- git diff for copilot-cli-pkg/ and source-atlas/

Requirements:
1. Use incremental reverse-engineering mode. Treat changelog and atlas differences as leads, not behavioral proof.
2. Confirm each material claim in the current app.js, SDK declarations, schemas, help text, packaged definitions, or adjacent current runtime files.
3. Review every candidate in docs/00-start-here/latest-subsystem-review.md. Inspect package entrypoints, callers, lifecycle/state, events or RPCs, cleanup, trust boundaries, and adjacent SDK/schema contracts before deciding.
4. Use `new-page` when a candidate has a distinct lifecycle, entrypoint, state model, protocol, or trust boundary. Create a focused source-anchored page with purpose/scope, anchor table, call path, data/events/config, failure/cleanup behavior, caveats, and related docs. Do not hide a genuinely new subsystem inside a release summary.
5. Use `existing-page` only when the candidate materially extends an already documented subsystem, and update that owning page. Use `not-a-subsystem` only for generated data, vendored assets, tests, packaging support, or confirmed scan noise.
6. In the subsystem review, replace every pending Decision, Documentation, and Source confirmation field. Documentation must link to the new or updated page for `new-page` and `existing-page`. Leave no pending fields.
7. Correct current architecture claims when code moved into native or out-of-process boundaries. Preserve useful old analysis only when clearly labeled historical with its package version.
8. Update docs/README.md, docs/SUMMARY.md, the nearest section README, website/astro.config.mjs, and documentation-opportunities.md when navigation or coverage changes.
9. Keep docs/00-start-here/latest-package-update.md machine-generated; do not edit it. You must edit latest-subsystem-review.md to record reviewed decisions.
10. Do not edit copilot-cli-pkg/, source-atlas/, scripts/, workflow files, or package lockfiles. Do not commit, push, open a pull request, or use network/web/GitHub tools.
11. Do not change unrelated prose or reformat unrelated files.
12. Run focused checks for touched pages and finish with:
   - npm run build from website/
   - node scripts/check-docs.mjs from the repository root
13. Leave a concise final summary in stdout. The workflow owns commit and PR creation.
