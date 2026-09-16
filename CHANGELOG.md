# Changelog

The repository's own record — what happened to the structure, not to any one package. Each package
keeps its own `CHANGELOG.md` for changes to itself.

Kept per [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), by date. No semver.

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
