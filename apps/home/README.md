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
together or not at all. A route of this app's own, like `/design-system`, is in none of them: the
SPA fallback already answers for it. Missing one does not give a 404: the SPA fallback answers with this app's
own document, and the sub-site quietly serves the wrong page.

## What it takes from the packages

[`penumbra`](../../packages/penumbra) — both sheets, as a dependency, and `src/styles/tokens.skin.css`
beside them is this site's own: eleven declarations, three typefaces and the eight colours a project
paints itself with.

**Those three files are the palette, and there is no second one.** `src/hooks/useTheme.ts` builds
the MUI theme by _resolving_ the token names off the document rather than carrying its own
hexadecimal — `primary.main` is `--app-primary`, `background.paper` is `--app-paper`, and so on
down. A component asking MUI for a colour and a stylesheet asking for `var(--app-*)` cannot
disagree. `yarn check:literals` keeps it that way: a hexadecimal anywhere in `src/**/*.tsx` fails
the check, because it would be a second palette starting — correct the day it was written, blind to
the colour scheme, and invisible to `yarn check:contrast`, which measures the tokens.

`useTheme` also stamps `data-color-scheme` on `:root`, which is the attribute penumbra's dark block
answers to. The toggle switches the whole palette, then rebuilds the theme from it.

`/design-system` loads the sheets as text and rewrites `:root` to the preview's own selector, which
is what lets three layerings share one page — the base alone, the base under
`src/styles/skins/tint.css`, and `src/styles/skins/replaced.css` with no base at all. The preview
resets the eleven names a skin declares, because a custom property inherits and this site declares
all eleven.

Those two example skins are demonstration material, so they live here rather than in the package,
which ships nothing that would read as a default. All three skins are held to WCAG AA by
`penumbra-contrast`, penumbra's own gate, which `yarn check` runs over each.

The pairing is the playgrounds' — a Palatino-class serif for display over a grotesque, mono for
identifiers — on system faces here, because this page is one screen of text and has no reason to
fetch a font file. The pairing is what makes the three read as siblings; the palettes deliberately
do not.

## No React Compiler

Every component here is wrapped in `memo()`, and the compiler's rule is that you stop doing that by
hand. Turning it on means rewriting the page, which is a change to the thing this app exists to
present. The rest of the toolchain is the repository's: Yarn, TypeScript 7, oxlint `--type-aware`,
oxfmt, Vite.
