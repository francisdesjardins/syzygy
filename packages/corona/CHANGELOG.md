# Changelog

Kept per [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), by date. No semver.

**This file is the package's memory.** The code states what holds now; why it came to hold lives
here.

## 2026-09-19, the highlighter's declarations travel with it

### Fixed — corona's ambient types did not reach corona's consumers

`corona/code` owns the syntax highlighter and imports it through deep paths, which have no
declarations of their own — `@types/react-syntax-highlighter` declares them and the compiler
reports TS7016 anyway, because a specifier that resolves to a shipped `.js` is not reconsidered
against an ambient declaration beside it. So the deep paths are restated in a `.d.ts`.

That file sat beside `HighlightedCode.tsx` and did nothing for anyone else: a consumer's program
compiles corona's **source** but does not include corona's stray declaration files, so both
playgrounds kept a copy of the same seven `declare module` blocks. Deleting theirs made both fail to
type-check, which is how the copies were earning their keep.

The module that needs them now references them, so they travel with the import. Both playground
copies are gone, and `@types/react-syntax-highlighter` leaves the repository with them — it was a
devDependency in two places and covered nothing the `.d.ts` does not.

The `react-syntax-highlighter` dependency **stays** declared in both playgrounds. Hoisting is
limited per package here, so it is not at the root, and antumbra's Vite config names its deep paths
in `optimizeDeps.include` — it has to resolve from the playground.

## 2026-09-18, one code block, and two bugs it was hiding

### Added — `corona/code`

Two playgrounds highlighted source, and not from one component: one had a 102-line block doing the
whole job, the other had the same job split three ways — a frame, a copy button and the highlighter
under it. Same name, two components.

The split one is corona's now, because the three pieces each carry a fix the monolith lacks: the
scroll region has a keyboard stop and a name, the `<code>` background is cleared so indentation
stops reading as a grey ladder, and the `<pre>`'s own `overflow` is turned off so one block is not
two nested scrollers. The copy button clears its timer on unmount, which the other did not — a
dialog that closes while the tick is pending left a `setState` behind it.

Line numbers come across as a prop, off by default: worth it for a whole file in a dialog, noise
beside a six-line example.

### Fixed — a code surface that had drifted off the token

`readableSyntaxStyle` raises every token colour to 4.5:1 **against the background the code is
actually on**, so the surface has to be a literal it can measure — both copies said so in a comment
warning that two literals drift. They had: one was `--app-paper`, the other `#1a1a1a`, which is not
a token at all. Every token in that playground's dark code blocks was being corrected for a
background it was not on. One literal now, and it matches the token in both schemes.

### Fixed — a block that rendered plain text and said nothing

One call site asked for `language="html"`. No grammar is registered under that name — Prism's is
`markup`, which is what every other call site in both playgrounds uses — and an unregistered
language renders as plain text and raises nothing. It is `markup` now, and `CodeLanguage` is a union
rather than a `string`, so the next one fails to compile instead of rendering grey.

## 2026-09-18, the whole shell is corona's

### Added — `AppShell`

The bar and the drawer were already here; what each playground still kept was the thing that
composes them — the breakpoint, the drawer's open state, the `shell`/`main`/`toolbarSpacer`/
`content` skeleton, the outlet under it and the mascot over it.

They were the same file. One stylesheet was **byte-identical** to another; the third differed by a
comment's wording and a `transition: margin-right` on a margin nothing anywhere changes.

What a playground actually owns turned out to be four things, and they are the four arguments:
its name, its mark, its routes and its moon. Each `RootLayout` is now that call and whatever else
that playground genuinely has — two of them wire a code dialog into `overlay`.

Three widget folders per playground become one. `widgets/top-bar` is gone in all three, the mark
moving to a `BrandMark` beside the other shared UI; `widgets/sidebar` keeps only the nav model it
always owned.

### Fixed — a drawer that arrived a frame late on every phone load

`useMediaQuery` existed twice. One version read `false`, then corrected in an effect: the desktop
layout rendered first and the drawer replaced it a frame later, on every narrow load. The other
subscribed through `useSyncExternalStore` and was right on the first paint. That one is corona's
now, and the two playgrounds that had the other one stop flashing.

## 2026-09-18, corona has no barrel, and now has a CLAUDE.md

### Removed — the `.` export

`corona` was imported two ways, split by which playground you were in: 74 bare `from 'corona'`
imports in antumbra and umbra, and none at all in penumbra, which had only ever used subpaths. One
package, two house styles, and no rule written anywhere saying which was right.

Subpaths win, on an argument the repository already makes twice: Vite serves modules unbundled in
dev, so a barrel pays for every area whatever the named import says — the reasoning both playgrounds
spell out for `react-syntax-highlighter`. The rewrite is mechanical and the map was read from
corona's own area barrels, so it could not disagree with them; a name missing from the map stopped
the run rather than being guessed at.

`src/index.ts` and the `.` entry in `exports` are gone with it. **That is what makes this a rule
rather than a convention** — the barrel does not exist, so nobody can reach for it, and no gate is
needed to watch for one.

While there: fourteen files were importing the same subpath twice. `import` and `import type` from
one subpath stay two statements, being two declarations.

### Added — `CLAUDE.md`, and a budget for it

corona, penumbra, gnomon and limb had no instruction file between them — the four packages that
exist to be shared were the four with no written rules, so every rule about them lived in a
consumer's document, twice over. corona's is the first, at 697 words of a 1200 ceiling, and
`yarn check` now measures it like every other one.

## 2026-09-18, one card surface, and it is the one with the arguments

### Added — `SurfaceCard`

Three playgrounds, three cards. umbra's and penumbra's were byte-identical to each other and
plainer: a large radius, and a shadow on hover. antumbra's is the developed one — an extra-large
radius, `overflow: clip` with a margin so a control flush against the edge keeps its focus ring, and
a hover that spends one glow token rather than a stack of shadows.

antumbra's is what stayed, and the reason is not that it is richer. Every choice in it has a
sentence beside it saying why; the other two had none. All four tokens it reaches for —
`--app-glow`, `--app-flame`, `--app-radius-xl`, `--app-lift` — are already declared in every skin,
so nothing had to be invented to make it travel.

This is a visible change on two sites: their cards gain the larger radius, and their interactive
ones gain the flame edge and the two-pixel rise on hover.

`data-surface-card` comes with it — the stable hook antumbra's smoke probe locates cards by, which a
hashed module class cannot be. No `className` and no `sx` passthrough: that escape hatch is what let
the cards drift inside one playground before they drifted between three.

## 2026-09-18, the top bar is corona's, and the mark is the only thing it asks for

### Added — `TopBar`

The three playgrounds carried a copy each: same header, toolbar, menu button, brand link, wordmark,
pill and spacer, differing in one element and one word. Roughly 135 lines of component and 90 of
stylesheet, three times over.

What the copying cost is legible in what it left behind. penumbra's stylesheet described **umbra's**
mark, at umbra's size — "the annular ring … 26px, which is what antumbra renders its own mark at" —
over a rule drawing a terminator at 22px. The comment travelled and the drawing did not.

`name` is both the wordmark and the link's label now, so the two cannot disagree. One bar read
`aria-label="umbra — home"` under a wordmark saying "Umbra"; a screen reader and a sighted reader
were given different names for the same product.

Each playground keeps a twenty-line adapter that supplies its name and its mark — the ring, the
terminator, `EclipseMark` — and its stylesheet keeps only the rule that draws it. antumbra's is gone
entirely, its mark being a component already. One more dead class name went with them:
`antumbra-wordmark` had no rule anywhere.

## 2026-09-18, `PageLayout` is corona's, and the slot it was going to need is not

### Changed — antumbra's copy is gone

This file's own note said antumbra kept a superset — the same layout plus a `result` panel — "across
twenty-nine call sites", and that turning it into a slot was "worth doing and is not this change".

Counted before designing the slot: **eleven** pages render that layout and **none** of them passes a
`result`. The prop was dead, and so was the panel it built and the stylesheet rule under it. What
went is the copy, not a slot nobody would have filled.

`ResultDisplay` stayed where it is. It is alive on the example cards and in two demos, which is
where a result actually belongs — beside the thing that produced it rather than at the top of the
page.

All three playgrounds now import one `PageLayout`: antumbra twelve times, umbra five, penumbra
three. Its twelve new import sites use `corona/shell` rather than the barrel, which is the reading
the repository already argues for elsewhere — a barrel pays for the whole package in dev, where Vite
serves modules unbundled.

## 2026-09-18, the three are in the order of the eclipse

### Changed — `PLAYGROUNDS` runs umbra, penumbra, antumbra

It ran antumbra, umbra, penumbra, and nothing anywhere said why — which is the answer: no reason,
so the first person to ask got one. The names come from the shadows an eclipse casts, and the
shadows have an order: the umbra is the full shadow, the penumbra is the partial one around it, and
the antumbra lies beyond the umbra's tip. Outward from the middle.

The home page listed the same three in the same arbitrary order, by hand. This module calls itself
"the only place they are named", which was not true of the order, so the root's `check:capabilities`
now compares the two and fails when they disagree. The other four lists it checks stay compared as
_sets_, because they are lookups and their order means nothing to anybody.

## 2026-09-18, the way out is the menu's first group

### Changed

`SiteLinks` is gone. The site and the sibling playgrounds are a group at the top of the drawer,
rendered by `Sidebar` on the same grid as every other group; `site/playgrounds.ts` is the data that
was left when the component went.

**A band under the menu was a special case, and both things wrong with it followed from that.** It
cost 70px of chrome for three 44px glyphs, and its first glyph aligned to neither the icon column
nor the label column, because there was no reason for it to align to either. A group cannot have
those problems: it is on the grid, and the empty space under a short menu goes back to being empty
space rather than something marooned in it.

The marks get their names back, which is what makes three unfamiliar glyphs legible — and the site
is named **Syzygy**, the alignment of three bodies that causes an eclipse. That is what its landing
page shows, and it was the one row in the repository's naming table with no word against it.

### Fixed

The pinning that made this necessary is also gone, along with the `margin-top: auto` that only
worked in one of the three shells.

## 2026-09-18, the drawer is one drawer

### Added

`Sidebar` — the navigation drawer, taking the host's `NAV_GROUPS` and nothing else.

**It was written twice and the two had drifted structurally**, which is not a thing a reader sees
until something depends on the shape. antumbra's was a full-height flex column with a scrolling nav
inside it. umbra's started below the top bar and scrolled as a block, with no flex at all — and
penumbra's was a copy of umbra's.

So `SiteLinks`, which pins itself to the bottom of the column with `margin-top: auto`, pinned in one
playground and floated in the other two. Measured at two viewport heights: 0px from the bottom in
antumbra against 163 and 371 elsewhere, with the panel itself 56px short of the window because it
began under the bar rather than behind it.

The column is what stayed, being the shape the pinned foot and the mobile drawer both need. Two
other halves were chosen the same way: the backdrop is a `<button>` with an accessible name rather
than a `<div>` with a click handler, and a route is current when the path matches exactly or a whole
segment deeper, so `/apiary` no longer lights `/api`.

What the host still owns is its routes and its icons.

## 2026-09-18, the icon sets collapse

### Added

`corona/icons` — the fourteen glyphs every playground draws.

The file that held umbra's copy predicted this: "the two sets are one set with two copies, and the
day the playgrounds share a monorepo these collapse rather than being reconciled." Measured on that
day, sixteen names were in both and **all sixteen were byte-identical** — the 51% a line-similarity
probe reported was antumbra's ten extra glyphs diluting a perfect match.

Two of the sixteen went nowhere. The sun and the moon belong to the theme toggle, which draws its
own since it moved here, and nothing else had imported them.

antumbra keeps the ten only it has. umbra's file is gone: its set was a strict subset.

## 2026-09-17, the shell moves here, and the way out becomes three marks

### Changed — `SiteLinks` replaces `PlaygroundPath`

The breadcrumb in the top bar is gone. The way out sits at the **foot of the navigation drawer**,
pinned there, as one row of glyphs: a house for the site, then a mark for each sibling playground.

Three named rows under a group label cost the drawer about 130px of its height for three links, and
"Home" is a flat word to meet between Antumbra and Umbra. The marks say it in 58px — and three of
them are the naming itself. Antumbra, umbra and penumbra are the three regions of a shadow, and a
reader meeting the words in a menu has no way to know that; drawn, they explain themselves. A fill
is deliberate there, the whole distinction being how much light gets through.

### Added — `src/theme/`

`ThemeContext`, `useTheme` and `ThemeToggleButton`. The **provider stays with each playground**,
because they do not agree on what else it does — antumbra's also feeds a template token set and
writes from a layout effect. What every one of them has is one attribute on the root element and a
hook to read it, which is enough for a shell component to be written once.

### Added — `PageLayout`

umbra's, moved. antumbra's is a superset — it renders a result panel from a `result` string, backed
by a component only that playground has, across twenty-nine call sites. Turning that into a slot is
worth doing and was not this change.

### Added — subpath exports

`corona/api`, `corona/mascot`, `corona/shell`, `corona/site`, `corona/theme`, `corona/tokens`.

The root barrel names every area, so a consumer importing one of them walks all of them — and the
API viewer reads its model from a virtual module only a playground with the generator provides. The
third playground has no library to document, and the first thing it did was fail to build on
somebody else's plugin. An area you do not use should cost nothing.

## 2026-09-17, the shell primitives move here

### Added

`src/shell/` — `AppButton`, `AppIconButton`, `appButtonClass`, `SelectionDropdown`, `SectionNav`
and `useDocumentTitle`.

Each pair differed by its import path and nothing else, except where one copy had quietly drifted —
and every drift was the same shape, one side keeping a fix or a token the other never got:

- `AppButton.module.css` — umbra carries `line-height: 1.25` with the bug it fixes written beside
  it: a `<button>` takes `normal` from the user agent while an `<a>` inherits the page's, which made
  two links 38px tall beside a 33px button. antumbra never had it.
- `AppIconButton.module.css` — antumbra had `200ms` where a token exists, and an `outline: none`,
  against its own instructions on both counts.
- `SectionNav.module.css` — antumbra had `monospace` and `300ms` as literals, and **no
  `prefers-reduced-motion` block at all**. umbra's comment says it was copied "on antumbra's rules";
  it was then improved and the improvement never went back.

So the better copy won each time, which is the whole argument for one of them existing.

`useDocumentTitle` takes `product` and `routes` rather than importing the host's nav table. The rule
— longest prefix wins, the distinguishing half first because a tab strip truncates from the right —
is the same everywhere; the table is not.

## 2026-09-17, the mascot moves here, and its face does not

### Added

`PeekingMoon` — the behaviour — and `EclipseMoon`, the drawing. Each playground keeps only its face.

The two copies of the behaviour were **339 identical lines out of 343**, and the two drawings were
83% of one another. Neither showed up in the register's duplication figure: one probe paired files
by path, and the mascot sits at `PeekingMoon/PeekingMoon.tsx` on one side and `PeekingMoon.tsx` on
the other; pairing by name then missed the drawings, which are called `AntumbraMoon` and `UmbraMoon`.

**The seam is the face, not the file.** What differs between the two is roughly twenty-five lines of
brows, eyes and mouth: antumbra smirks because it spends its life putting a shadow over your page,
umbra watches because it starts a run it cannot hurry. So `face` is a render prop taking the ink
colour, and the corona, the disc, the eight flames, the three flicker curves and the halo are one
file.

`PeekingMoon` takes the whole drawing as a node rather than a component, which is what lets it know
nothing about the host's theme. It is remounted on every phase change — the `key` is what restarts
the per-visit animation — so what it is given must hold no state. The faces are pure SVG.

## 2026-09-17, the way out becomes a path

### Added

`PlaygroundPath` — `Home / playground / Antumbra · Umbra`, where the current one carries this
project's mark and the others are links. It replaces `SiteHomeLink`, which was removed.

**It is also the only place the playgrounds are named.** Three surfaces had been naming the same
things differently: the bar said `francisdesjardins.ca`, a URL where everything else was a name;
home's work section said `antumbra`; the design-system pages said `Back to the home`. A table of
two entries here is what makes them agree, and it keeps the two registers apart on purpose — a
**slug is a capability** (`dialog`, `boot`) and a **name is a package**. A package is renamed the
day a better word turns up; a deployed URL that followed it would break every link anybody kept.
`deploy.mjs` already said so from the other end.

**It never renders nothing**, which is the difference from what it replaces. Off the site there is
no `/` and no sibling, so the same path renders as plain text instead of disappearing. A component
that vanished under `yarn dev` would be invisible for the whole of the work that changes it.

The `Playground` pill went with it: the path's own middle segment says `playground`, and the bar was
otherwise printing the project's name twice — once as a wordmark, once inside the path.

### Fixed

Below 900px the bar keeps only the segment saying where you are. Nothing in that row can shrink — a
flex item's `min-width` is `auto` — and the full path at 360px is what pushed the theme toggle off
the right edge when it was a text link.

## 2026-09-17, the stacking table said the opposite of the sheet

### Fixed

`SYSTEM_GROUPS.stacking` listed the mascot last, which on a design-system page reads as the topmost
layer. It was tied with the sidebar at the time and is now the bottom one, so the table had been
telling both playgrounds' readers the reverse of what the CSS did.

### Added

`check-token-coverage.mjs` now holds that group in ascending order, reading each value out of
penumbra's sheet. Every other group's order is a reading order and editorial; this one is a claim
about the numbers, which makes it the only one that can be wrong. A guard beside it fails if the
list or the values stop being readable, so a regex that stops matching cannot pass as a tidy scale.

## 2026-09-17, the site link collapses on a phone

### Fixed

**`SiteHomeLink` was pushing the theme toggle off the top bar at 360px**, on every route of one
playground. Nothing in that row can shrink — a flex item's `min-width` is `auto` — so the longest
item decides whether the last one stays on screen, and `← francisdesjardins.ca` is the longest item
in it. The two shells are the same markup; antumbra's longer wordmark and wider mark are the thirty
pixels between passing and failing, which is why one playground showed it and the other did not.

Below 600px the label is hidden and the arrow carries the link alone, with the name on `aria-label`
— a visually hidden label is still the accessible one. **The link itself stays**: it is the only way
out of a playground, and dropping it on a phone would be the same failure one size down.

The fix belongs here rather than in either shell for the reason the component does: it exists
identically in both, and it does not need to know which library it is showing. A future third shell
gets it without being told.

Found by the repository's new `yarn check:mobile`, which measures the assembled site at two phone
widths.

## 2026-09-17, the design-system tables become the third area

### Added

`src/tokens/` — `TokenSwatches`, `TokenScale`, `useTokens`, `SYSTEM_GROUPS` and one stylesheet.

The two design-system pages were 221 lines of byte-identical CSS and about 120 lines of the same
component written twice: a swatch, a row, a card of rows, and a hook that reads
`getComputedStyle(document.documentElement)`. None of it knew which library it was under, which is
exactly the entry rule this package already had.

The seam is the one the token files make. **The system half's names and their grouping are here**,
because they are the same in every project that imports penumbra; **colour is the host's**, because
it is the half a project rewrites — so each playground passes its own list and its own notes, and
the notes were never the same anyway.

`SurfaceCard` is a slot rather than a component this package owns. The two are genuinely different:
one is a hairline and a radius, the other lifts on hover behind a corona.

### Added — the table of contents is checked

`yarn check:tokens` reads `penumbra/tokens.system.css` and fails on a declaration no group claims,
on a group naming a token the sheet no longer declares, and on a token filed in two groups.

Which group a token belongs to is editorial — a reader wants leading beside the ramp rather than
beside whatever the sheet declares next to it — but whether it appears at all is not. **Eleven of
the forty-seven were on neither page**: every line height, every tracking step, `--app-radius-pill`,
and the whole of layout and stacking. Both pages gained a _Layout & stacking_ section for them, and
it immediately showed one thing prose had not: `--app-z-sidebar` and `--app-z-mascot` are both 30,
so which paints over which is source order rather than a decision. Left as it is and now visible.

### Fixed

**The tables read the outgoing scheme's values on a theme flip, in one of the two playgrounds.**

`useTokens` took the scheme from the host's context and re-read when React said it changed. React
runs a child's effects before its parent's, so a provider that writes `data-color-scheme` from an
ordinary effect writes it _after_ the table has already measured. antumbra's provider uses a layout
effect and was right by accident; umbra's does not and was wrong from the day the page was written.

It watches the attribute with a `MutationObserver` now, which is true whoever sets it and whenever
they do — and the `scheme` prop the provider used to need is gone, so the host has one less thing to
pass correctly.

### Added — `isOnSite`

The rule `SiteHomeLink` already carried, as a function. A playground is a standalone build: run on
its own, a link to `/design-system` points at a page that is not there. Both design-system pages use
it for their way across to the site's.

## 2026-09-17, the reference becomes an area rather than the package

### Changed

Everything moved under `src/api/`, which owns its own barrel. `src/index.ts` is now one line per
area.

The old layout said what this package was allowed to hold, and it said it by accident: `src/ui/` and
`src/model/` at the top claimed the whole package for one subject. The file names admitted it —
`ApiCategoryPage`, `ApiIndexPage`, `ApiLayout`, `ApiRail`, `api-index`, `use-api-scroll`. A prefix on
every file is a directory asking to exist.

It costs nothing today and a great deal later: the package is one commit old, so this was 24
`git mv`, one barrel and one line of `exports`. **No consumer file changed** — `corona` and
`corona/contract` still name the same things.

What it buys is a rule that a file can fail. "The showcase chrome" has no such rule; _does this
exist identically in both playgrounds, and does it need to know which library it is showing?_ does.
`MuiIsland` fails it, because only one playground has MUI. The two moon faces fail it — they are two
identities, not one component copied. `StoriesPage` fails it at 146 lines against 1593: two
contracts, not a copy. `PeekingMoon` passes, at 342 lines with eight of difference.

## 2026-09-16, the reference stops existing twice

### Added

The API reference viewer and the contract it reads: 25 files out of each playground's `pages/api`,
and the four model types that had been declared once per generator.

The extraction was refused a week earlier, in the phase that produced [limb](../limb). The reason
given was that the route needs five components from `shared/ui` and four of them differ by design —
`CodeBlock` on 117 of its 129 lines. That was true and it was not a reason.

**The mistake was one of method.** The route's imports were measured as a flat set across all its
files, so the worst dependency vetoed the directory. Nobody asked _which_ files needed the divergent
components. The answer is five of twenty-five; the other twenty need nothing that differs.

### What the measurement found once it was asked properly

Before any of this, 15 of 25 files were byte-identical between the two playgrounds and 8 more
differed by a single import line — the virtual module, named after its library on one side. Naming
it after the capability instead took the count to 19 and 1269 lines.

Three of the six remaining divergences were a superset, not a disagreement: one library's model can
emit a `class` kind and the other's cannot, so its badge table and stylesheet lacked the tone. One
was a redundant prop, both buttons already defaulting to it. One was a focus-ring fix present on one
side only. That left `ApiIndexPage`, whose entire difference is three tables of per-library data —
which entry points exist, what each is for, what to call it.

So the seam was never where it was declared to be. It runs between **the generated model and the
page that shows it**, not between two directories.

### The two failures worth keeping

**A second copy of `@tanstack/react-router`.** Each workspace group is its own hoisting boundary, so
this package resolves its own. A router is a _value_ registered by the host's provider; a second copy
resolves to an empty one and every hook throws on null. `react` was deduplicated in both consumers
before this landed, on advice; the router was not, because it did not look like the same problem.
`yarn type-check` passed, `vite build` passed, and the page rendered "Something went wrong". The
smoke test found it.

**A name that said which package rather than what it does.** The slot contract shipped first as
`ApiChrome`, and the provider as `CoronaProvider`. "Chrome" means the furniture _around_ content, so
it was inaccurate for components used _inside_ it, and it collides with the Chrome this repository
automates through a skill. `CoronaProvider` named the package — which is the exact anti-pattern this
repository applies to URLs, module specifiers and translation keys. They are `ApiSlots` and
`ApiReferenceProvider`.
