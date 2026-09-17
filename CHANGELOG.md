# Changelog

The repository's own record — what happened to the structure, not to any one package. Each package
keeps its own `CHANGELOG.md` for changes to itself.

Kept per [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), by date. No semver.

## 2026-09-16, corona, and the error that had left it unshared

### Added

`packages/corona` — the generated API reference, which had existed twice. 25 files per playground,
1443 lines byte-identical by the time it moved. Its own [CHANGELOG](packages/corona/CHANGELOG.md)
carries the design; this entry carries the mistake.

**The extraction was refused in the limb phase, and the refusal was a method error.** The route's
imports were measured as a flat set across all its files, so the worst dependency — five UI
components that genuinely differ between the two products — vetoed the whole directory. Nobody
asked *which* files needed them. Five of twenty-five; the rest need nothing that differs.

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
router is a *value* registered by the host's provider, so the second copy is empty and every hook
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
