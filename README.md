# Copilot CLI Internals

Reverse-engineering wiki for the [`@github/copilot`](https://www.npmjs.com/package/@github/copilot) CLI, based on static analysis of the extracted bundle in [`copilot-cli-pkg/app.js`](copilot-cli-pkg/app.js). The notes target whatever bundle currently sits in `copilot-cli-pkg/`; see its [`package.json`](copilot-cli-pkg/package.json) for the exact analysed version.

The notes are organised into eight reader-oriented sections (runtime, context, sessions, tools, security, models, agents, operations) rather than mirroring the bundle's file layout. Because `app.js` is minified, symbol names are unstable — source anchors are pointers for grepping the analysed bundle, not public API.

## Semantic alias and minified anchor mapping

This repository README is a project entry point, not a direct `app.js` implementation analysis. Concrete mappings live in the wiki pages under `docs/`.

| Semantic alias | Minified anchor | Scope |
|---|---|---|
| Repository overview | N/A — project navigation page | Describes the workspace and where to read the wiki. |
| Documentation source | See `docs/` page-level mappings | Each wiki page maps stable semantic aliases to version-specific minified anchors. |
| Extracted package artifacts | N/A — vendor/source artifacts | Files under `copilot-cli-pkg/` preserve the extracted package and are not normalized as project docs. |

## Repository layout

| Path | Contents |
|---|---|
| [`docs/`](docs/) | Source markdown (61 pages across 8 sections). Start at [`docs/README.md`](docs/README.md). |
| [`copilot-cli-pkg/`](copilot-cli-pkg/) | The extracted `@github/copilot` package being analysed. |
| [`website/`](website/) | Astro + Starlight site that renders `docs/` as a browsable wiki. |
| [`help/`](help/) | Captured `--help` text from the CLI, used as a primary source. |

## Browse the wiki

Published at **<https://copilot-cli.genisisiq.com>**.

To run the site locally:

```sh
cd website
npm install
npm run dev
```

## Author

Created and maintained by **Yingting Huang**.
