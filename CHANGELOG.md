# Changelog

The repository's own record — what happened to the structure, not to any one package. Each package
keeps its own `CHANGELOG.md` for changes to itself.

Kept per [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), by date. No semver.

## 2026-09-17, the phone is a gate now

### Added

`yarn check:mobile` — the assembled site, in a real browser, at 390px and 360px. Sixteen routes
across all three surfaces, and three assertions on each: nothing crosses the right edge, the drawer
opens with its links **on screen**, and every dialog the page can open stays inside the viewport.

It runs on `apps/home/dist` rather than on a dev server, because the shell is what is being measured
and a playground served on its own is a different layout from the one a reader gets.

Nothing else here could see either failure. A unit test, a type-check and a contrast measurement all
pass through a navigation drawer that never slides in.

### Fixed

**At 360px the site link pushed the theme toggle eleven pixels off the top bar**, on every route of
antumbra's playground. Nothing in the row can shrink — a flex item's `min-width` is `auto` — so the
longest item decides whether the last one stays on screen, and `← francisdesjardins.ca` is the
longest item. The two shells are the same markup; antumbra has a longer wordmark and a wider mark,
which is the thirty pixels between passing and failing.

The fix is in [corona](packages/corona)'s `SiteHomeLink`, where the link already lives, so both
shells and any future one get it: below 600px the label is hidden and the arrow carries the link
alone, with the name on `aria-label`. **The way back to the site stays reachable on a phone** —
removing it would be the failure this gate is for, at a smaller size.

### Each half was proved lethal

Overflow: the real 360px defect. Dialog geometry: a `min-width: 500px` forced onto `dialog[open]`,
which the gate reported by name, by route and by pixel. Navigation: the drawer pinned at
`translateX(-100%)`.

That third mutation is the one that improved the gate. It failed on two routes out of ten, because
the check counted `nav a` — and a page with its own section list has links that are visible while
the drawer is not. Scoped to `aside a`, which is where both shells put the drawer, and to links
actually **inside the viewport** rather than merely laid out.

## 2026-09-17, one strictness, and the app was not holding it

### Added

`tsconfig.base.json` at this root: the twenty options every workspace compiles the same way. Each
`tsconfig.json` is `extends` plus what is genuinely its own — the libraries it needs, the ambient
types it loads, whether it emits declarations. The chains below them are untouched: the two
`tsconfig.build.json`, the two `tsconfig.registry.json` and both playgrounds already extended their
package's config and now inherit through it.

It is written out rather than taken from `@tsconfig/strictest`, for the reason the lint config is:
a strictness that arrives from a dependency is one nobody here has agreed to, and the day it changes
is a day the gates move without a commit.

### Fixed

**`apps/home` was missing four of them** — `exactOptionalPropertyTypes`,
`noPropertyAccessFromIndexSignature`, `allowUnusedLabels: false` and `allowUnreachableCode: false` —
which is what a strictness maintained in five files by hand eventually looks like. Turning them on
cost two lines: `process.env.NODE_ENV` twice, now bracketed. `exactOptionalPropertyTypes`, the one
that usually hurts, produced nothing.

### How it was proved

`tsc --showConfig` prints the resolved configuration with the extends chain applied, and that is the
acceptance test — a clean type-check is not, because a strictness option that silently stopped
applying passes exactly like one that was never on. Before and after, per workspace: four resolve
byte-identically, and the site's gains those four lines and nothing else.

## 2026-09-17, the formatter has one config and finally reaches everything

### Changed

Five byte-identical `.oxfmtrc.json`, one per workspace, are one at this root. oxfmt walks up from
the directory it runs in, so nothing needed rewiring — and a workspace that ever wants a different
answer still gets it by putting a config beside its own manifest. None does.

The file set each workspace formats is unchanged: every count dropped by exactly one, which is the
deleted config formatting itself.

### Added — `yarn format:check` at the root

And it found that **`penumbra` and `gnomon` have been formatted by nothing at all.** Both are
packages with no build: their `check` runs a token gate or an explicit no-op, so neither ever
reached a formatter, and neither had a config for one. `yarn.config.cjs` already carried this exact
lesson — it requires a `check` script of every workspace because gnomon "was linted, formatted and
type-checked by nothing at all" — and the rule it grew from that only fixed half of it. A script
that exists is not a script that formats.

927 files in 1.7 seconds, so the whole tree is cheaper to check than to reason about which part of
it is covered. The root's own `README.md`, `CHANGELOG.md`, `deploy.mjs` and `package.json` were
outside the formatter too, and are in it now.

### Where the tooling stands

Every workspace runs the same pair — oxlint with its type-aware half on tsgolint, and oxfmt —
against the same TypeScript 7. There is no eslint and no prettier anywhere in the tree, and
`apps/home` has been on oxc since it was written.

## 2026-09-17, the lint surface is one file

### Changed

`.oxlintrc.json` at this root holds the rules, the plugins and the overrides every workspace shares.
Each workspace's own config is `extends` plus the part that is genuinely its own — antumbra keeps
its generated-examples and microfrontend entries, umbra its stories and type fixtures, and
[corona](packages/corona) and [limb](packages/limb) are four lines each, which is the honest length
for a package that adds nothing.

Four of the five configs were **byte-identical, 314 lines**, including overrides for a `playground/`
and a `public/mfe/` that two of them do not have. The fifth, umbra's, was the same 82 rules at 223
lines, and it had drifted where drift is invisible: its untyped-JavaScript override switched off
**19** type-aware rules against antumbra's 40, so the two linted their own build scripts to
different standards and nothing said so.

Two changes of behaviour, both deliberate. The untyped-JavaScript override is now globbed by **file
extension** rather than by a list of directories, because that is the actual rule — every `.js` and
`.mjs` here lives outside `src/` and is in no tsconfig, so tsgolint infers nothing and then judges
what it inferred. And `no-restricted-imports`, the MUI barrel lock, moved to the two workspaces that
depend on MUI; a restriction on an import the other three cannot resolve is a rule that cannot fail.

### Added — how the change was proved

**The repository lints clean, so a diff of findings before and after is a diff of two empty lists**,
and `--print-config` cannot answer it either: for an extended config it drops rule _options_,
printing `max-params: "deny"` where the behaviour is still `2`. Either would have signed off a rule
that quietly lost its teeth.

So: plant one violation per rule class per location — `src/`, a test, a build script, a `dist/` that
should be ignored, a playground, the microfrontend fragments — in all five workspaces, and diff
**which rule fires on which file**. Fifty-two assertions, and the run caught a real regression
before the commit: umbra's microfrontend fragments had fallen from `no-console: error` to the root's
`warn`, which no other check in the repository would have reported.

### Learned about the tool

`rules`, `plugins`, `env` and `options` are inherited through `extends`, and a child's `overrides`
are **appended** to the parent's rather than replacing them. **`ignorePatterns` is not inherited at
all** — not even by a child that declares none — so that one list is written out identically in all
five, and that duplication is the tool's rather than a choice. Measured against oxlint 1.83.0.

## 2026-09-17, the last page written twice

### Changed

The two design-system pages were 221 lines of byte-identical CSS and about 120 lines of the same
components. They are [corona](packages/corona)'s third area now, beside the API reference and the
site links — the same entry rule each time: does this exist identically in both playgrounds, and
does it need to know which library it is showing?

The seam inside the page is the one the token files already make. The system half's names and their
grouping travel; colour stays with the project, which is why the notes beside each swatch were never
the same anyway.

**Two things fell out of doing it.** corona's new `check:tokens` found eleven system tokens on no
page in the repository — every line height, every tracking step, and the whole of layout and
stacking — and a browser probe found that one playground had been showing the outgoing scheme's
values after every theme flip since the page was written.

## 2026-09-17, what the work is, said once

### Changed

The landing page presented this as front-end work. The repository has not been that for a while:
umbra's core reaches no framework and needs no DOM, which its own tests assert, and one declared
graph boots a page, a worker or a service. The copy says so now, in both languages and in the
static head a link scraper reads — and `yarn check:head` in the home keeps those two from drifting
apart again, which is how they came to disagree.

The two playgrounds are no longer disallowed in `robots.txt`. They were filed as "development and
testing routes"; they are the work.

## 2026-09-17, the last palette maintained twice

### Changed

`apps/home` runs on penumbra. Its colour was the MUI palette, written in hexadecimal in
`useTheme.ts`; it is `tokens.skin.css` over the base now, and the theme is built by resolving
those names off the document. The three surfaces this repository ships finally answer one question
one way, and the site's own [CHANGELOG](apps/home/CHANGELOG.md) carries what that moved on screen.

That leaves nothing in the repository declaring a colour outside a token sheet — which is a claim,
so it has a gate: `yarn check:literals` in the home, beside the two that already guard the package.

## 2026-09-17, the design system gets a page, and the gate a home

### Added

`apps/home` grows a second route, `/design-system`, where penumbra is taken apart: one specimen,
three layerings, a switch. The base alone; eleven declarations over it, which is the shape both
playgrounds use; and a skin that declares all 24 base names itself, so nothing is left of the
package but the scale. Its own [CHANGELOG](apps/home/CHANGELOG.md) carries how it stays honest.

`penumbra-contrast` — the contrast gate, which was umbra's script and was one copy away from being
two. It went to penumbra rather than to `gnomon`: the pair table is a statement about what
`--app-primary-ink` and `--app-primary` mean, and those names belong to the design system, not to
the tooling. antumbra, which had no static colour gate at all, gained the line for free.

## 2026-09-17, the ground under two palettes

### Changed

The two playground skins were the last place a value was maintained twice, and the claim that
protected them was that a palette is a project's own. Measured, 47 of their declarations were
identical in both schemes — the surfaces, the text ranks, the edges, the states, the four semantics,
the scrim and the lift. Those are a ground, not a palette, and they are
[penumbra](packages/penumbra)'s `tokens.skin.base.css` now. Each playground keeps twelve
declarations: three faces, a lockup rise, and eight colours.

This reverses a refusal penumbra's README carried. It had aimed at a default palette, which is still
refused — the package ships neutrals and semantics, and nothing a project would recognise as a
brand. penumbra's own [CHANGELOG](packages/penumbra/CHANGELOG.md) carries that argument.

**The gate runs in both directions now.** The system half already refused colour; the base refuses a
typeface, refuses the eight brand-shaped names, and refuses any token the system half declares —
two files answering for one name means import order decides, rather than intent.

## 2026-09-16, corona, and the error that had left it unshared

### Added

`packages/corona` — the generated API reference, which had existed twice. 25 files per playground,
1443 lines byte-identical by the time it moved. Its own [CHANGELOG](packages/corona/CHANGELOG.md)
carries the design; this entry carries the mistake.

**The extraction was refused in the limb phase, and the refusal was a method error.** The route's
imports were measured as a flat set across all its files, so the worst dependency — five UI
components that genuinely differ between the two products — vetoed the whole directory. Nobody
asked _which_ files needed them. Five of twenty-five; the rest need nothing that differs.

The seam was never between two directories. It runs between the **generated model** and the **page
that shows it**: each playground keeps its typedoc generator, corona holds the contract and the
viewer, and the host lends its components through named slots.

### Changed

`virtual:dialog-api` and `virtual:umbra-api` are both `virtual:api-model`. One specifier, and 8
files stopped diverging — the rule this repository already applied to URLs, deploy destinations and
translation keys, applied where it had been missed.

Four more primitives moved to [limb](packages/limb): `mutex`, `single-flight`, `shallow-equal`,
`slice-declaration`. Those were never duplicated; they existed **once**, reachable only by the
playground that wrote them, which is the other half of what a shared package is for.

Ports are assigned across the repository with `strictPort`, after a stray home dev server on the
shared :3000 answered a component suite's readiness check with the home page's own HTML and made
every test fail on a missing `window.mount()`.

### The failure worth keeping

A second copy of `@tanstack/react-router`. Each workspace group is its own hoisting boundary; a
router is a _value_ registered by the host's provider, so the second copy is empty and every hook
throws on null. `react` had been deduplicated in both consumers beforehand; the router had not,
because it did not look like the same problem. Type-check passed, build passed, the page rendered
"Something went wrong" — and `yarn smoke` is what said so.

## 2026-09-16, the site is built here now

### Added

`apps/home` — francisdesjardins.ca's homepage, out of a 250-file scratchpad it had been living in
and into the repository that holds the libraries it links to. 17 files, the traced closure of the
one route that is online. Its own [CHANGELOG](apps/home/CHANGELOG.md) carries what moved and why.

`deploy.mjs`, and `yarn deploy` with it. The script that assembled the site used to sit beside the
three projects rather than inside any of them; it now sits at this root. **Nine steps where there
were eleven, and the two that went are the whole argument for a monorepo**: the old script ran an
install per project, because there were three projects.

`apps/*` joins `packages/*` in the workspace list. The distinction it draws is the only one that
matters here: a package is depended on, an app is deployed.

### The measurement that keeps a vitrine honest

This page is the one thing in the repository with an audience that did not come looking for source
code, so it got a gate the others do not have. Before a file moved, the live build was fingerprinted
at 448 lines — the DOM tree with 35 computed properties per element, the whole head, the JSON-LD,
in four render combinations, plus what both toggles do when clicked.

Every claim below is that diff coming back empty, three separate times: after the move, after the
toolchain conversion, and measured from inside the deploy zip rather than the tree that made it.

- `tokens.system.css` was a **third** copy of penumbra, identical in every declaration. Now a
  dependency — the second time that file's own header predicted its own removal and was right.
- `LocalizationProvider`, `@mui/x-date-pickers` and `date-fns` served fields that do not exist on
  this page.
- `react` 19.2.8 → 19.3.0, so the lockfile holds one React and not one per app.

### Fixed

A latent defect in `useDocumentHead`, found by pointing the type-aware lint at code it had never
seen: `querySelector(…) as HTMLMetaElement` erased the `null` that `querySelector` actually
returns, leaving the branch that creates the tag unreachable to the type checker and perfectly
reachable at run time.

### Removed

stardust's redirect rule. Nothing in this repository can build it, and a rule pointing at a
directory the deploy never fills does not 404 — it falls through to the SPA and hands the visitor
the home page under a URL that promised something else. It had been served from an untracked build
that existed in exactly one working tree.

## 2026-09-16, limb, and what measuring first removed from it

### Added

`packages/limb` — `color-contrast`, `fuzzy-match` and `readable-syntax`, with the 35 tests that had
existed on only one of the two copies. Private, and framework-free by rule rather than by habit.

This phase was planned as the largest of the five and came out the smallest. It was written to
absorb "the playground shell" at 28 files; it took 3. The shell turned out not to be shared at all
— the layout, the sidebar and the navigation diverge because the two playgrounds demonstrate
different libraries and hold different pages. The API reference route read as 943 shareable lines
until its dependencies were traced: it needs five components, four of which differ by design.
`CodeBlock` diverges on 117 of its 129 lines.

### The measurement that drew the boundary

Seven modules sat at `shared/lib` in both playgrounds. Sorted by whether they import anything at run
time, they sorted perfectly: the three with no run-time import were **byte-identical**; the four
that reach for React had each drifted, by 11 to 38 lines. Nothing in between.

Two copies of a pure function stay equal because there is one right answer and both authors found
it. Two copies of a hook drift because each bends toward the app around it. So framework-freedom is
`limb`'s entry rule, not its description — it is the property that made these three shareable.

`useDocumentTitle` diverges by one line, a product-name constant, and was still left out: it is a
hook, and taking it would put React in the package whose claim is that it needs none.

### Fixed

`packages/antumbra/CLAUDE.md` was 3002 words against its own 3000-word budget, over since the gnomon
entry above rewrote the workspaces paragraph. The gate had been red at that commit and was not run.

## 2026-09-16, gnomon takes the gates

### Added

`packages/gnomon` — 891 lines of tooling that existed twice, one copy per library: the JSDoc example
checker, the component-coverage instrumenter and its report, the reset step, and the formatter every
generator shares. Private; it exists to be depended on here.

Two of the divergences between the copies were not cosmetic, and both are the argument for the
package rather than against it. **The formatter had a fix on one side only** — raising on a parse
error rather than returning the text unchanged, without which the example checker reads an
unparsable example as one that needed no formatting. **The two coverage reports listed different
causes** for finding no counters, each written by whoever hit that particular failure in the copy
they happened to be working in. The merged list carries four.

### Changed — the tools read the package that ran them

Nothing in gnomon resolves paths against its own location. `process.cwd()` is the package being
checked, its `package.json` names the library, and its `exports` say which entry points exist —
which retires the one hand-written list that actually differed between the two copies.

The instrumenter is the exception and takes its root as an argument, because only the caller knows
it. Its plugin type comes from the caller too: installing vite in gnomon would put a second copy
beside each library's own, and two structurally identical `Plugin` types are not assignable to each
other — the same trap that set this repository's hoisting boundary.

### Fixed

A pre-existing lint warning in the dialog manager's story-id generator, surfaced when the move
invalidated oxlint's cache: `.sort()` on `(string | undefined)[]` with no comparator. It sorted by
UTF-16 code unit, which put every capitalised harness ahead of every lowercase one.

## 2026-09-15, umbra and antumbra trade names

### Changed

`umbra` now names the bootstrapper and `antumbra` the dialog manager. 231 files, 1009 swapped
occurrences, 13 renamed files and two directories that had to pass through a temporary name.

`umbra` is the root the other two derive from — _pen_·umbra, _ant_·umbra — so it belongs to the
package the others build on, and everything boots. _Ante umbra_, "in front of the shadow", is where
a modal `<dialog>` renders. Each package's own changelog carries the reasoning; this entry is about
what the move touched across the repository.

**Excluded, on this repository's own rule:** the changelogs. "A changelog that edits its own past is
a story, not a record" — the dialog manager's has been through this once before and says so in its
header, which now names both renames.

**Not mechanical, and rewritten by hand:** anything that _justified_ a name rather than using it. A
lexical pass leaves those asserting falsehoods — the bootstrapper's mascot claimed "an umbra is the
ring past the apex", which is what an antumbra is. Both mascot doc comments, both skin headers and
both favicons were rewritten instead of swapped.

**The favicons swapped drawings, not just words.** They depict the shadow region itself: a wide disc
with a corona around it is an umbra, a thin ring with no bite is an antumbra. Keeping each with its
old library would have left both tabs illustrating the wrong name. This is the one visible change to
the deployed playgrounds.

**Nothing in the deployed URLs moved.** `/playground/dialog` and `/playground/boot` are named for
the capability, which is the entire reason they are.

### Changed — the import tags are named for the capability too

`import/umbra` and `import/antumbra` became `import/dialog` and `import/boot`. A tag naming a
library points at the wrong history the moment that library is renamed, and this one just was.

## 2026-09-15, penumbra becomes a package

### Added

`packages/penumbra` — the portable half of the design system, and the first thing this repository
existed to extract. The file it holds lived in both playgrounds as a copy whose own header predicted
this move. See that package's changelog for what the copies had and had not drifted on.

## 2026-09-15, the shell

### Added

`umbra` and `antumbra` entered by `git subtree`, with their history: 378 and 23 commits, both
reachable to the initial commit. Yarn 4 workspaces, the release vendored in `.yarn/releases` because
Node 26 unbundled Corepack and the `yarn` on a normal PATH is a 1.22 that refuses to run this
project at all.

### Changed — one lockfile, and a hoisting boundary that is the package

Subtree brought each repository's own `yarn.lock`, `.yarnrc.yml` and vendored release, which made
every package a separate Yarn project root: the scripts chain `yarn x && yarn y`, the inner call
re-resolved to the nested project, and that project had no install state. The nested roots are gone.

Hoisting is then limited per package, through `installConfig` in each package rather than a
project-wide setting. Project-wide was tried first and was wrong: it gives a package and its
playground a copy of Vite each, and the playground's config takes a plugin from the package, so two
structurally identical `Plugin` types meet and type-checking stops. The boundary has to be the
package — one `node_modules` per package, shared with its playground, which is how each repository
resolved on its own. It is also what keeps `node node_modules/typescript-7/bin/tsc` working: a
hard-coded path, because `typescript` and its `typescript-7` alias both ship a `tsc` binary and
neither can own `.bin/tsc`.

### Note — reading history across the subtree boundary

`git log -- packages/antumbra/<file>` shows only the merge, and `--follow` does not bridge it
either: subtree brings each commit in at the path it had in its own repository. Ask the import point
with the old path instead — `git log import/antumbra -- src/core/types.ts`. Both import points are
tagged for exactly this.
