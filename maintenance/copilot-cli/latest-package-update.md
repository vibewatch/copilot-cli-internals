# Latest automated Copilot CLI package update

> This rolling report is maintained by `scripts/update-copilot-cli-docs.mjs`. Changelog and source-atlas deltas are discovery leads; behavioral claims still require confirmation in the extracted runtime, SDK, schemas, help, or packaged definitions.

## Current baseline

| Field | Value |
|---|---|
| Package | `@github/copilot` |
| Version | `1.0.71` |
| Build commit | `3286dc4` |
| Runtime bundle | `copilot-cli-pkg/app.js` |
| Atlas | `source-atlas/summary.json` |

No newer package was available when the weekly automation was initialized. The first scheduled version change will replace this page with a generated previous/current package comparison, named-surface delta, stable release-note inventory, changed-file summary, and documentation checklist.

For the manual analysis that established this baseline, see [Copilot CLI 1.0.71 package delta](copilot-cli-1.0.71-delta.md). For workflow setup and trust boundaries, see [Weekly documentation update automation](weekly-update-automation.md).

New subsystem and module candidates are tracked separately in [Latest subsystem and module review](latest-subsystem-review.md). A distinct lifecycle, entrypoint, state model, protocol, or trust boundary should result in a focused new page, not only an edit to this rolling release report.

## Update contract

When npm publishes a newer `@github/copilot-linux-x64` platform package, the workflow will:

1. extract the embedded `@github/copilot` package at the resolved version;
2. regenerate `source-atlas/`;
3. replace this report with exact package and named-surface deltas;
4. generate a candidate review for new package roots, module entrypoints, and event/RPC namespaces;
5. optionally run Copilot CLI to resolve each candidate and create focused subsystem pages where warranted;
6. build and validate the website;
7. open an update pull request.

If npm reports the same version, the workflow exits without changing files or opening a pull request.
