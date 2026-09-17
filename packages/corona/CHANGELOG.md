# Changelog

Kept per [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), by date. No semver.

**This file is the package's memory.** The code states what holds now; why it came to hold lives
here.

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
