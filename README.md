# She's On First — Women's Baseball Media

Marketing + editorial site for **She's On First**, built with **Vite + React + TypeScript** and
`react-router-dom`. Dark, athletic esports-inspired theme derived from the brand logo
(purple/indigo + teal/mint over navy).

## Pages

| Route | Page |
|-------|------|
| `/` | Home — hero, Inaugural 60 preview, mission, project notes, updates status |
| `/about` | About the outlet |
| `/inaugural-60` | Provisional 60-player working roster |
| `/inaugural-60/:slug` | Player profile route, gated until editorial review is complete |
| `/blog` | Project methodology notes |
| `/blog/:slug` | Project note reader |
| `*` | 404 |

The roster is a **provisional working reconstruction**. Player profiles remain unpublished until
their source, editorial, and image-rights reviews are complete.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
```

## Build

```bash
npm run build    # type-checks, then outputs static site to dist/
npm run preview  # preview the production build locally
```

## Deploy to Hostinger (shesonfirst.com)

This is a static single-page app, so it deploys as plain files — no Node runtime needed on the server.

1. `npm run build` locally. The finished site is the **contents of `dist/`**.
2. In hPanel → **Files → File Manager** (or via FTP), open `public_html` for `shesonfirst.com`.
3. Delete any placeholder files there (e.g. Hostinger's `default.php`), then upload **everything
   inside `dist/`** — including the `assets/` folder — into `public_html`. Upload the whole
   folder contents, not the `dist` folder itself.
4. The included **`.htaccess`** is copied into `dist/` by the build. It must land in `public_html`
   so deep links / refreshes (e.g. `/inaugural-60`) resolve to the SPA instead of a 404. File Manager
   hides dotfiles by default — enable "show hidden files" if you don't see it.

To update the site later: `npm run build` again and re-upload the new `dist/` contents.

> Tip: you can zip the contents of `dist/`, upload the single zip in File Manager, and extract it in
> `public_html` — faster than uploading files one by one.

## Customizing

- **Content:** `src/data/articles.ts`, `players.ts`
- **Brand colors / fonts:** CSS variables at the top of `src/index.css`
- **Source logo:** `assets/brand/shes-on-first-logo-transparent.png`
- **Website logo assets:** `public/logo-lockup.png`, `public/badge.png`, `public/favicon.png`
- **Newsletter:** currently shown as coming soon; add a provider before restoring an email form.
