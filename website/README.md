# Copilot CLI Internals — Documentation Website

A static documentation site built with [Astro](https://astro.build) +
[Starlight](https://starlight.astro.build), styled per the brand system
defined in the repo-root [`DESIGN.md`](../DESIGN.md).

The markdown source of truth lives in [`../docs/`](../docs/) and is
read directly by Astro's content loader — no copy step, no symlinks.

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
| `src/styles/` | DESIGN.md tokens + theme overrides (split by concern) |
| `src/components/` | Hedgehog mascot + Starlight slot overrides |
| `src/assets/` | Self-hosted fonts, hedgehog SVGs |
| `public/` | Favicon and other static files served at root |

## Notes on the design system

See [`../DESIGN.md`](../DESIGN.md) for the canonical token table.
The CSS layer mirrors that document file-by-file:

| DESIGN.md section | Style file |
|---|---|
| Colors / Surface | `src/styles/tokens.css` + `src/styles/theme.css` |
| Typography | `src/styles/typography.css` |
| Callout banners | `src/styles/callouts.css` |
| Code blocks | `src/styles/code.css` |
| Cards / Tiles / Pills | `src/styles/components.css` |
