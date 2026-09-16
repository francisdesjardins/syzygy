# home

francisdesjardins.ca — one page, and the door to everything else here.

It is a front door before it is a demo: whoever lands on it should come away knowing who wrote
these libraries and what they refuse to do. The two entries under _What's running_ link out to the
playgrounds by capability — `/playground/dialog`, `/playground/boot` — never by library name.

```bash
yarn dev      # :3000
yarn build
yarn check    # type-check, lint --deny-warnings, format:check
```

## It is deployed from the repository root, not from here

`yarn deploy` at the root builds both playgrounds, drops each into `public/playground/<capability>/`,
builds this app over the top and leaves `francisdesjardins.ca-dist.zip`. That directory is build
output and is not tracked; `yarn build` here alone produces the home with no playgrounds under it.

**A destination name is carried in four places** — the table in `deploy.mjs`, the rule in
`public/_redirects`, the dev rewrite in `vite.config.ts`, and the link on the page. They move
together or not at all. Missing one does not give a 404: the SPA fallback answers with this app's
own document, and the sub-site quietly serves the wrong page.

## What it takes from the packages

[`penumbra`](../../packages/penumbra) — the system tokens, as a dependency. `src/styles/tokens.skin.css`
beside it is this site's own and sets **typefaces only**; colour lives in the MUI palette in
`src/hooks/useTheme.ts`, because MUI components have to read it from the theme anyway and two
sources for one colour is how they drift apart.

The pairing is the playgrounds' — a Palatino-class serif for display over a grotesque, mono for
identifiers — on system faces here, because this page is one screen of text and has no reason to
fetch a font file. The pairing is what makes the three read as siblings; the palettes deliberately
do not.

## No React Compiler

Every component here is wrapped in `memo()`, and the compiler's rule is that you stop doing that by
hand. Turning it on means rewriting the page, which is a change to the thing this app exists to
present. The rest of the toolchain is the repository's: Yarn, TypeScript 7, oxlint `--type-aware`,
oxfmt, Vite.
