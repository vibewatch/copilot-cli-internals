Update this repository's hand-written Copilot CLI internals documentation for the package version that has already been extracted into copilot-cli-pkg/. You are running through a separately installed native Copilot CLI; treat copilot-cli-pkg/ only as analysis evidence and do not execute its app.js.

Start by reading:
- .agents/skills/reverse-engineering/SKILL.md
- docs/00-start-here/latest-package-update.md
- git diff for copilot-cli-pkg/ and source-atlas/

Requirements:
1. Use incremental reverse-engineering mode. Treat changelog and atlas differences as leads, not behavioral proof.
2. Confirm each material claim in the current app.js, SDK declarations, schemas, help text, packaged definitions, or adjacent current runtime files.
3. Update existing owning pages instead of creating duplicate subsystem pages. Create a focused page only for a genuinely new lifecycle.
4. Correct current architecture claims when code moved into native or out-of-process boundaries. Preserve useful old analysis only when clearly labeled historical with its package version.
5. Update docs/README.md, docs/SUMMARY.md, the nearest section README, website/astro.config.mjs, and documentation-opportunities.md when navigation or coverage changes.
6. Keep docs/00-start-here/latest-package-update.md machine-generated; do not edit it.
7. Do not edit copilot-cli-pkg/, source-atlas/, scripts/, workflow files, or package lockfiles. Do not commit, push, open a pull request, or use network/web/GitHub tools.
8. Do not change unrelated prose or reformat unrelated files.
9. Run focused checks for touched pages and finish with:
   - npm run build from website/
   - node scripts/check-docs.mjs from the repository root
10. Leave a concise final summary in stdout. The workflow owns commit and PR creation.
