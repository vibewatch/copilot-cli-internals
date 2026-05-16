# Copilot CLI Internals — Documentation Website

A static documentation site built with [Astro](https://astro.build) +
[Starlight](https://starlight.astro.build), styled with the site-local
CSS token system under `src/styles/`.

The markdown source of truth lives in [`../docs/`](../docs/) and is
read directly by Astro's content loader — no copy step, no symlinks.

## Semantic alias and minified anchor mapping

This README documents the website wrapper, not the minified runtime. Concrete mappings live in the loaded docs pages.

| Semantic alias | Minified anchor | Scope |
|---|---|---|
| Website wrapper | N/A — project tooling page | Explains Astro/Starlight development, build, deployment, and layout. |
| Loaded documentation pages | See `../docs/` page-level mappings | Each rendered wiki page maps stable semantic aliases to version-specific minified anchors. |
| Extracted package artifacts | N/A — vendor/source artifacts | `copilot-cli-pkg/` Markdown files preserve upstream package content and are not part of the website source set. |

## Develop

```sh
cd website
npm install
npm run dev       # http://localhost:4321
```

## Build

```sh
npm run build     # outputs static site to ./dist
npm run preview   # serve ./dist locally
```

## Analytics

Set `PUBLIC_GA_ID` to a Google Analytics 4 measurement ID
such as `G-ABC123DEF4` before building. The tag is only emitted in
production builds (`npm run build`), not during local dev.

For GitHub Pages, add it as a repository variable:

1. Open **Settings → Secrets and variables → Actions → Variables**.
2. Add `PUBLIC_GA_ID` with your GA4 measurement ID.
3. Re-run the **Deploy website to GitHub Pages** workflow, or push to `main`.

## Deploy

The included workflow at
[`../.github/workflows/deploy-website.yml`](../.github/workflows/deploy-website.yml)
publishes `./dist` to GitHub Pages on every push to `main`. Enable
Pages in the repo settings (Source: GitHub Actions) to activate it.

For other hosts (Cloudflare Pages, Netlify, Vercel) point the
deploy at the `website/` directory with build command `npm run build`
and output directory `dist`.

## Layout

| Path | Purpose |
|---|---|
| `astro.config.mjs` | Site config, sidebar, Starlight integration |
| `src/content.config.ts` | Content collection — reads `../docs/**/*.md` |
| `src/styles/` | CSS tokens + theme overrides (split by concern) |
| `src/components/` | Hedgehog mascot + Starlight slot overrides |
| `src/assets/` | Self-hosted fonts, hedgehog SVGs |
| `public/` | Favicon and other static files served at root |

## Notes on the design system

The canonical token definitions live in `src/styles/tokens.css`.
The rest of the CSS layer mirrors those tokens file-by-file:

| Design-system area | Style file |
|---|---|
| Colors / Surface | `src/styles/tokens.css` + `src/styles/theme.css` |
| Typography | `src/styles/typography.css` |
| Callout banners | `src/styles/callouts.css` |
| Code blocks | `src/styles/code.css` |
| Cards / Tiles / Pills | `src/styles/components.css` |
