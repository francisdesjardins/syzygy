# home

francisdesjardins.ca — one page, and the door to everything else here.

It is a front door before it is a demo: whoever lands on it should come away knowing who wrote
these libraries and what they refuse to do. The three entries under _What's running_ link out to
the playgrounds by capability — `/playground/dialog`, `/playground/boot`, `/playground/design` —
never by library name.

```bash
yarn dev      # :3000
yarn build
yarn check    # type-check, lint --deny-warnings, format:check
```

## It is deployed from the repository root, not from here

`yarn deploy` at the root builds the three playgrounds, drops each into
`public/playground/<capability>/`, builds this app over the top and leaves
`francisdesjardins.ca-dist.zip`. That directory is build output and is not tracked; `yarn build`
here alone produces the home with no playgrounds under it.

**A destination name is carried in four places** — the table in `deploy.mjs`, the rule in
`public/_redirects`, the dev rewrite in `vite.config.ts`, and the link on the page. They move
together or not at all, and `yarn check:capabilities` at the root is what holds them to each other
in both directions. Missing one does not give a 404: the SPA fallback answers with this app's own
document, and the sub-site quietly serves the wrong page under a URL that promised something else.

This app has exactly one route of its own, `/`. Everything else it answers for is a playground.

## What it takes from the packages

[`penumbra`](../../packages/penumbra) — both sheets, as a dependency, and `src/styles/tokens.skin.css`
beside them is this site's own: eleven declarations, three typefaces and the eight colours a project
paints itself with.

**Those three files are the palette, and there is no second one.** Nothing resolves these names
into a second representation — the stylesheets read them and that is all. `yarn check:literals`
keeps it that way: a hexadecimal anywhere in `src/**/*.tsx` fails the check, because it would be a
second palette starting — correct the day it was written, blind to the colour scheme, and invisible
to `yarn check:contrast`, which measures the tokens. `yarn check:tokens:used` closes the other
direction: every `var(--app-…)` this app spends has to name a token one of the three sheets
declares.

`src/hooks/useTheme.ts` stamps `data-color-scheme` on `:root`, which is the attribute penumbra's
dark block answers to. Setting it is the whole of switching the palette, and it runs at module
scope so the first paint is already the right scheme.

There is no component library here: `src/styles/app.css` is the reset and the element defaults, and
`src/components/IconButton.tsx` is the one control the page needs.

Penumbra's own shopfront is its playground at `/playground/design`, not a page of this site — the
three layerings, the token tables and the example skins live there, held to WCAG AA by that
workspace's `check:contrast`.

The pairing is the playgrounds' — a Palatino-class serif for display over a grotesque, mono for
identifiers — on system faces here, because this page is one screen of text and has no reason to
fetch a font file. The pairing is what makes the three read as siblings; the palettes deliberately
do not.

## The head is the page, for half the readers

`#root` is empty until the bundle runs. Googlebot runs it; Slack, LinkedIn, X and iMessage do not —
they read `index.html`'s head and stop. So the head carries the same four sentences the application
renders (`seo.home.*` in `src/i18n/translations/en/common.json`) rather than a second version of
them, and **`yarn check:head` fails when they drift apart**, which is how they came to disagree for
a year.

English only, because the head has one language and `defaultLng` is `en`. French is checked for
presence; a translated head would need a server this site does not have.

The structured data is a `@graph`: the person, then umbra, antumbra and penumbra as
`SoftwareSourceCode` nodes, each pointing at a surface a reader can open. **`codeRepository` is
absent on purpose** — the repository is private, and a field pointing at a 404 is worse than a
missing one. It is the one thing waiting on the push.

The same gate compares `theme-color` and the manifest's two colours against `--app-primary` and
`--app-bg`, because a colour in a `.json` or a `<meta>` is a palette one layer below where
`check:literals` can see.

## No React Compiler

The three components that re-render on their own — the page and the two switches — are wrapped in
`memo()` by hand, and the compiler's rule is that you stop doing that. Turning it on means rewriting
the page, which is a change to the thing this app exists to present. The rest of the toolchain is the repository's: Yarn, TypeScript 7, oxlint `--type-aware`,
oxfmt, Vite.
