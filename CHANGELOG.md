# Changelog

The repository's own record — what happened to the structure, not to any one package. Each package
keeps its own `CHANGELOG.md` for changes to itself.

Kept per [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), by date. No semver.

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
