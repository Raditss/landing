# Vizier landing

The website at [www.vizier.rs](https://www.vizier.rs): landing page, blog and
documentation.

Built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build).
The landing page and blog use React components and tokens from the
[`design`](https://github.com/vizier-lab/design) library; the docs are the
contents of `vizier/docs/` rendered by Starlight.

The site is a submodule of [vizier](https://github.com/vizier-lab/vizier). It is
developed inside a vizier checkout because both the docs and the design system
come from there:

```text
vizier/
  design/            the design system
  docs/              documentation source
  landing/           this repository
```

## Local development

From a vizier checkout:

```sh
just install            # installs design, webui and landing dependencies
cd landing && npm run dev
```

Or manually:

```sh
git clone --recurse-submodules https://github.com/vizier-lab/vizier.git
cd vizier
(cd design && npm install)
cd landing
VIZIER_SOURCE=.. node scripts/link-design.mjs
VIZIER_SOURCE=.. npm install
VIZIER_SOURCE=.. npm run dev
```

`npm run dev` and `npm run build` sync `docs/src` from the vizier checkout
first. The generated docs collection (`src/content/docs/docs/`) and the
`design/` symlink are not committed.

If you have `landing` and `vizier` as sibling checkouts instead, point at the
source explicitly:

```sh
VIZIER_SOURCE=../vizier npm install
VIZIER_SOURCE=../vizier npm run dev
```

The scripts look for a vizier checkout in this order:

1. `$VIZIER_SOURCE`
2. the parent directory (when `landing/` is inside `vizier/`)
3. `../vizier`

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Sync docs, then start Astro on `localhost:4321` |
| `npm run build` | Sync docs, then build `dist/` |
| `npm run check` | `astro check` |
| `npm test` | Unit tests for the docs sync (node:test) |
| `npm run check-links` | Check internal links in `dist/` |
| `npm run sync` | Sync docs without starting the site |
| `npm run link` | Recreate the `design/` symlink |
| `npm run og` | Regenerate `public/og.png` (needs a Playwright browser) |

## Documentation

Docs are authored in `vizier/docs/src/`, not here. The sync script:

- copies every markdown page into the Starlight collection;
- adds the page title and an edit link to the vizier source;
- strips the source H1 (Starlight renders the page title itself);
- rewrites relative `.md` links to `/docs/.../` routes;
- builds the sidebar from `docs/src/SUMMARY.md`.

Links that point outside the docs tree (the memory format examples contain
illustrative links such as `gryffindor.md`) and links inside code fences are
left alone.

After changing docs in the vizier checkout, run `npm run sync` (or restart
`npm run dev`) to see them.

## Deployment

The landing repository owns the GitHub Pages site.

- Push to `master` → build and deploy.
- `repository_dispatch` of type `vizier-release` → build and deploy with the
  version and docs ref in the payload.
- `repository_dispatch` of type `design-updated` → build and deploy with the
  catalogue taken from the design commit in `client_payload.sha`.
- `workflow_dispatch` → manual deploy with optional `version` and `ref`.
- A `vizier` docs change can dispatch the same event with `ref: master`.

Every deploy also builds the design system's Storybook and publishes it at
`/design`. The catalogue source is `vizier-lab/design` at the dispatched commit,
or `master` for any other deploy — deliberately the current design, not vizier's
submodule pin, so a design push publishes without waiting for a pin bump. That
build happens before the Pages artifact is uploaded, so a Storybook that fails
to build fails the deploy instead of shipping a broken catalogue.

`vizier` sends the dispatch from its release workflow. It needs a
`LANDING_DISPATCH_TOKEN` repository secret: a fine-grained PAT scoped to
`vizier-lab/landing` with **Contents: Read and write** (classic `repo` scope also
works).

The deploy workflow checks out vizier at `.vizier-source`, installs the design
dependencies, links them in, and builds with:

| Variable | Source | Purpose |
|---|---|---|
| `SITE_URL` | `configure-pages` output | Canonical URL and OG image origin |
| `BASE_PATH` | `configure-pages` output | `/` on the custom domain, `/landing` on a project Pages URL |
| `VIZIER_VERSION` | dispatch payload, manual input, or latest release | Version chip |
| `VIZIER_SOURCE` | workflow | Docs and design source |

The same build works at `https://vizier-lab.github.io/landing/` and at
`https://www.vizier.rs` because Astro's base path is taken from Pages.

### First-time Pages setup

1. Settings → Pages → Source: **GitHub Actions**.
2. Add the custom domain `www.vizier.rs` (and verify it if GitHub asks).
3. Remove the custom domain from the old `vizier-landing` repository, or GitHub
   will not let this repository claim it.

`book.vizier.rs` stays on the vizier repository and redirects to
`www.vizier.rs/docs/`.

## Content

- Blog posts: `src/content/blog/*.md`; frontmatter is validated in
  `src/content.config.ts`.
- Pages: `src/pages/`.
- Landing sections: `src/components/landing/`.
- Design tokens and components: imported from `design/` as
  `@vizier/design`, exactly as the WebUI does.
- Landing screenshots: `src/assets/shots/`, captured from a throwaway Vizier
  instance with demo data, dark theme only (the site is dark only). Replace them
  when the WebUI changes.
- Hero video: `public/media/vizier-launch.mp4`, with its poster beside it.
- `public/og.png` is generated from `scripts/make-og.mjs`.

The site has no analytics, comments, or runtime API calls. Everything is static.

## License

MIT. See [LICENSE](./LICENSE).
