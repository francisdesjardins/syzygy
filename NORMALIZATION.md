# What is shared, what is not, and why

The point of this repository is to combine and normalise everything that is genuinely shared. That
only means something if the other half is written down too — so this is the register: what has been
unified and what holds it there, what is deliberately still different, and what is simply not done
yet.

**A line moves out of the third table by being fixed or by being argued into the second one.** The
danger is a divergence that is neither — one nobody decided on and nobody is tracking, which is what
every entry in the first table used to be.

Last measured 2026-09-17.

## Unified, and what holds it

A rule without a gate is a preference, so each row names the thing that fails when the row stops
being true.

| What                      | Where it lives now                       | What holds it                                           |
| ------------------------- | ---------------------------------------- | ------------------------------------------------------- |
| Lint rules                | `.oxlintrc.json`, each workspace extends | `yarn lint` at the root, over every file                |
| Formatting                | `.oxfmtrc.json`, one for the tree        | `yarn format:check` at the root, over every file        |
| TypeScript strictness     | `tsconfig.base.json`, each extends       | each workspace's `type-check`                           |
| Type-only imports         | `tsconfig.base.json`, all 13 configs     | `type-check`, and `docs:examples` for the snippets      |
| Script bodies             | each manifest, checked against the rest  | `yarn constraints` — one name, one command              |
| Dependency versions       | one range per ident                      | `yarn constraints` — one version per dependency         |
| A workspace being seen    | every workspace has `check` and `test`   | `yarn constraints` — an explicit no-op counts           |
| The hoisting boundary     | `installConfig.hoistingLimits`           | `yarn constraints`, asymmetric and commented            |
| Design tokens             | `penumbra`                               | `check-tokens.mjs`, both halves, both directions        |
| Colour contrast           | `penumbra`                               | `penumbra-contrast`, 32 pairs × both schemes            |
| The token tables          | `corona`                                 | `check-token-coverage.mjs` — every token is on a page   |
| The API reference viewer  | `corona`                                 | antumbra's and umbra's smoke suites                     |
| The way back to the site  | `corona`                                 | `yarn check:mobile`                                     |
| Framework-free helpers    | `limb`                                   | its entry rule: if it needs a framework, it is not limb |
| The gates themselves      | `gnomon`                                 | `yarn check` in each consumer                           |
| Agent-instruction budgets | `gnomon-doc-budget`                      | `yarn doc-budget`, a ceiling and a headroom line each   |
| Tokens that are read      | `gnomon-token-usage`                     | `check:tokens:used` in all five consumers               |
| Phone layout              | —                                        | `yarn check:mobile`, 16 routes × 2 widths               |
| The stacking scale        | `penumbra/tokens.system.css`             | `check-tokens.mjs` — no two layers share a number       |
| The playground shell      | `corona/shell`, `/theme`, `/mascot`      | each playground's `verify:all`, and `yarn check:mobile` |
| The way between them      | `corona/site` — one table of three       | `yarn check:mobile`, 20 routes × 2 widths               |

**No component library anywhere.** The three playgrounds were always CSS modules on penumbra's
tokens; home carried MUI for ten primitives and dropped it. The one exception is deliberate and
scoped: antumbra's `MuiIsland` is the subject of a card, not a dependency of a shell.

**Devtools are one decision, not seven.** Every workspace runs oxlint with its type-aware half on
tsgolint, oxfmt, and TypeScript 7 — the same versions, enforced by the dependency constraint. There
is no eslint and no prettier anywhere in the tree, and no workspace is on an older compiler than the
linter that judges it.

## Different on purpose

Each of these was looked at and kept apart. The reason is the value of the row: without it the next
reader has to rediscover it, and the cheapest way to look thorough is to unify something that should
not be.

**`SurfaceCard`.** A slot the playgrounds fill rather than a component `corona` owns. One is a
hairline and a radius; the other lifts on hover behind a corona. Sharing them would mean one of the
two products losing its own surface.

**The two API generators.** `vite-plugins/api-model.ts` exists twice and the copies share about half
their lines — different entry points, different categories, different symbol handling. That is a
real difference between two products. What they do agree on is the _shape they emit_, and that
agreement is `corona`'s `contract.ts`.

**The palettes.** Each project's `tokens.skin.css` is eleven or twelve declarations — three faces and
the brand. Colour is the half a project rewrites; the neutral half underneath it is
`penumbra/tokens.skin.base.css` and is shared. The seam is where the token files already put it.

**Twelve script names**, each with its reason in `yarn.config.cjs`. `check`, `test` and `verify:all`
are every workspace's own gate; `type-check` runs two programs in a library and one in an app;
`test:component` differs because antumbra has touch and focus projects umbra has not.

**`lib` and `types` in each `tsconfig.json`.** `DOM.Iterable` where a `NodeList` is walked,
`vite/client` in the app that needs it. Adding either everywhere would claim a capability a package
does not use.

**`no-restricted-imports`** lives in the two workspaces that depend on MUI. A restriction on an
import the other three cannot resolve is a rule that cannot fail.

**Home is a showcase; the playgrounds are the projects.** The site listed three works and hosted
one of them — penumbra's only shopfront was `/design-system`, a page _of_ home, which made a
stylesheet read as a peer of two libraries rather than as what they are built on. It has a
playground now and home has three links. The two playgrounds kept what is theirs: six colour
declarations and their own controls, under `/skin`.

**The og-image is French on an English-default site**, and that is the author writing in his own
voice rather than a string somebody forgot to translate — "danseur de tes rêves" does not survive
being made bilingual. It was listed as an undecided divergence, which was a misreading of a joke.
The card works as it is: 2.5 MB sits under every scraper's 5 MB limit, and a 1.91:1 crop of a 3:2
image keeps the whole text block. Alt text is the one thing genuinely missing, and it is copy in a
language this repository does not get to choose.

**`createStore` exists twice and was never a collision.** The backlog had it beside
`normalizeError` as one problem, which was an impression formed from the file names: umbra's
`createStore` is 56 lines, antumbra's 198, 212 of 254 lines differ — but only antumbra _exports the
function_. Umbra's index publishes the `ReadableStore` and `Store` types and keeps the builder
internal, so no application can import both. Two internals that happen to share a name are not a
divergence, and renaming one to fix a clash nobody can hit would be churn.

`normalizeError` was the real half of that entry, and it is now umbra's `serializeError`.

**`ignorePatterns`, written out five times.** oxlint does not inherit it through `extends` — not even
into a child that declares none, which was measured against 1.83.0. That duplication is the tool's
and not a choice; the comment in each file says so.

## Not done

**The playground shell is corona's now, and there are three playgrounds.** What follows is what the
measurement below led to: the mascot (339 identical lines of behaviour, with the face left behind as
a prop), the button family, the dropdown, the section nav, the document title, `PageLayout` and the
theme context all moved. `penumbra` gained a playground of its own at `/playground/design`, whose
main page was the one both siblings were already rendering.

**Three things did not move, and each has a reason.** antumbra's `PageLayout` is a superset — a
`result` panel backed by a component only it has, across 29 call sites. The `ThemeProvider` differs
in substance: antumbra's feeds a template token set and writes from a layout effect. `SurfaceCard`
is a slot by an older decision that still holds.

**What is left to measure.** `HomePage.module.css` at 70% and `icons.tsx` at 51% were not looked at.
That gap the third playground found — a `var(--app-…)` naming a token nothing declares — is closed:
`gnomon-token-usage`, run by all five consumers.

**The number published here was wrong, and the probe was why.**

This entry used to say "8 byte-identical files, 289 lines", and concluded that what remained was a
few stylesheets under components that legitimately differ. Both halves came from a probe with a
blind spot: it paired files by their path relative to each `src/`, and antumbra is
folder-per-component where umbra is flat. `PageLayout/PageLayout.tsx` and `PageLayout.tsx` are the
same component and never met. Pairing by **file name**, across the 62 names present on both sides:

|                | By path            | By name                   |
| -------------- | ------------------ | ------------------------- |
| Byte-identical | 8 files, 289 lines | **10 files, 384 lines**   |
| 60% or more    | 11 files           | **19 files, 1 512 lines** |
| 80% or more    | not measured       | **18 files**              |

The largest item is `PeekingMoon.tsx` at **339 of 343 lines**, which the old method never saw.
Behind it: `SelectionDropdown.tsx` and `useDocumentTitle.ts` at 98%, `AppButton.tsx` 96%,
`AppIconButton.module.css` 94%, `RootLayout.module.css` 93%, `PageLayout.module.css` 84%,
`TopBar.module.css` 80%, `SectionNav.module.css` 79%.

**The method was the defect, so the method is the entry.** A similarity probe is a measuring
instrument, and this one reported the repository far cleaner than it is. Pair by what a reader means
by "the same component", not by what the filesystem happens to agree on.

What follows is not a list of files to move one by one. It is that the playground _shell_ — the bar,
the layout, the buttons, the dropdown, the mascot — is written twice and is about to be wanted a
third time. Each candidate still has to pass corona's entry rule, _does this exist identically in
both and does it need to know which library it is showing_, rather than a percentage: `PeekingMoon`
scores 99% and fails that rule read naively, because the drawing inside it is each project's and
only the behaviour around it is shared.

`entities/example` stays regardless. `ExampleCard.tsx` forks on behaviour — antumbra treats
`children` and `example` as alternatives and wraps children in `.controls`, umbra stacks them — and
its stylesheet forks with it, 3 shared selectors and 2 identical. Moving `ExampleSection` and
`ExampleGrid` without the card would split a family every page composes as a unit.

**A smaller thing found on the way.** `shared/ui` in antumbra is folder-per-component with a barrel;
umbra's is flat files. Antumbra's barrels are not a convention yet — 4 of 15 components have none,
so the 10 imports that name a file directly have no alternative. Exactly one import bypasses a
barrel that does exist: `entities/example/ui/ExampleCard.tsx` reaching
`@/shared/ui/SurfaceCard/SurfaceCard`. `fsd-layers.test.ts` does not catch it and is right not to —
its rule is the stated one, _cross-slice_ imports, and `shared` is segments with no slices in it.

**Two stale directories sit beside this repository** — `dialogManager/` and `antumbra/` in
`D:\workspace\francisdesjardins\2025\` — holding the pre-monorepo copies of code that now lives in
`packages/`. Deleting someone's working directories is not this repository's call, so they are
recorded here instead.

**The GitHub repository does not exist yet.** `origin` is set to
`github.com/francisdesjardins/syzygy` and answers "Repository not found", so nothing has been pushed.
That is why the site's JSON-LD omits `codeRepository`: a link to a 404 is worse than a missing field.
