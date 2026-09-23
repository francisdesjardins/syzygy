# Changelog

The repository's own record — what happened to the structure, not to any one package. Each package
keeps its own `CHANGELOG.md` for changes to itself.

Kept per [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), by date. No semver.

> **Frozen 2026-09-21, and condensed to one line per change.**
>
> Decisions live in [`docs/decisions/`](docs/decisions/README.md) now — one file per decision, changed
> in place rather than restated on a new date. See
> [0004](docs/decisions/0004-the-decision-log-is-the-history.md) for why.
>
> These entries were written as essays, because this file used to be where the reasoning lived.
> The reasoning has moved, so what is left here is the record: what changed, on which date. **The
> full original prose is in this file's git history, at commit ab066b7 and earlier.** New entries
> go above this line, one line each.

## 2026-09-17, a budget nobody could land under

### Added

- `gnomon-doc-budget` — the agent-instruction gate, now shared.

### Changed

- where 500 words went instead of being deleted

### Fixed

- the budgets were snapshots, not targets

## 2026-09-17, the gates were not linted either

### Added

- `yarn lint` at this root, over the whole tree.

### Fixed

- what the first run found

## 2026-09-17, one name, one command

### Added

- `yarn.config.cjs` gains a rule: a script name declared by more than one workspace must mean the same command in all of them.

## 2026-09-17, the phone is a gate now

### Added

- `yarn check:mobile` — the assembled site, in a real browser, at 390px and 360px.

### Fixed

- **At 360px the site link pushed the theme toggle eleven pixels off the top bar**, on every route of antumbra's playground.

### Notes

- Overflow: the real 360px defect.

## 2026-09-17, one strictness, and the app was not holding it

### Added

- `tsconfig.base.json` at this root: the twenty options every workspace compiles the same way.

### Fixed

- **`apps/home` was missing four of them** — `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`, `allowUnusedLabels: false` and `allowUnreachableCode: false` — which is what a strictness maintained in five files by hand eve...

### Notes

- `tsc --showConfig` prints the resolved configuration with the extends chain applied, and that is the acceptance test — a clean type-check is not, because a strictness option that silently stopped applying passes exactly like one that was...

## 2026-09-17, the formatter has one config and finally reaches everything

### Added

- `yarn format:check` at the root

### Changed

- Five byte-identical `.oxfmtrc.json`, one per workspace, are one at this root. oxfmt walks up from the directory it runs in, so nothing needed rewiring — and a workspace that ever wants a different answer still gets it by putting a config...

### Notes

- Every workspace runs the same pair — oxlint with its type-aware half on tsgolint, and oxfmt — against the same TypeScript 7.

## 2026-09-17, the lint surface is one file

### Added

- how the change was proved

### Changed

- `.oxlintrc.json` at this root holds the rules, the plugins and the overrides every workspace shares.

### Notes

- `rules`, `plugins`, `env` and `options` are inherited through `extends`, and a child's `overrides` are **appended** to the parent's rather than replacing them.

## 2026-09-17, the last page written twice

### Changed

- The two design-system pages were 221 lines of byte-identical CSS and about 120 lines of the same components.

## 2026-09-17, what the work is, said once

### Changed

- The landing page presented this as front-end work.

## 2026-09-17, the last palette maintained twice

### Changed

- `apps/home` runs on penumbra.

## 2026-09-17, the design system gets a page, and the gate a home

### Added

- `apps/home` grows a second route, `/design-system`, where penumbra is taken apart: one specimen, three layerings, a switch.

## 2026-09-17, the ground under two palettes

### Changed

- The two playground skins were the last place a value was maintained twice, and the claim that protected them was that a palette is a project's own.

## 2026-09-16, corona, and the error that had left it unshared

### Added

- `packages/corona` — the generated API reference, which had existed twice. 25 files per playground, 1443 lines byte-identical by the time it moved.

### Changed

- `virtual:dialog-api` and `virtual:umbra-api` are both `virtual:api-model`.

### Notes

- A second copy of `@tanstack/react-router`.

## 2026-09-16, the site is built here now

### Added

- `apps/home` — francisdesjardins.ca's homepage, out of a 250-file scratchpad it had been living in and into the repository that holds the libraries it links to. 17 files, the traced closure of the one route that is online.

### Removed

- stardust's redirect rule.

### Fixed

- A latent defect in `useDocumentHead`, found by pointing the type-aware lint at code it had never seen: `querySelector(…) as HTMLMetaElement` erased the `null` that `querySelector` actually returns, leaving the branch that creates the tag...

### Notes

- This page is the one thing in the repository with an audience that did not come looking for source code, so it got a gate the others do not have.

## 2026-09-16, limb, and what measuring first removed from it

### Added

- `packages/limb` — `color-contrast`, `fuzzy-match` and `readable-syntax`, with the 35 tests that had existed on only one of the two copies.

### Fixed

- `packages/antumbra/CLAUDE.md` was 3002 words against its own 3000-word budget, over since the gnomon entry above rewrote the workspaces paragraph.

### Notes

- Seven modules sat at `shared/lib` in both playgrounds.

## 2026-09-16, gnomon takes the gates

### Added

- `packages/gnomon` — 891 lines of tooling that existed twice, one copy per library: the JSDoc example checker, the component-coverage instrumenter and its report, the reset step, and the formatter every generator shares.

### Changed

- the tools read the package that ran them

### Fixed

- A pre-existing lint warning in the dialog manager's story-id generator, surfaced when the move invalidated oxlint's cache: `.sort()` on `(string | undefined)[]` with no comparator.

## 2026-09-15, umbra and antumbra trade names

### Changed

- `umbra` now names the bootstrapper and `antumbra` the dialog manager. 231 files, 1009 swapped occurrences, 13 renamed files and two directories that had to pass through a temporary name.
- the import tags are named for the capability too

## 2026-09-15, penumbra becomes a package

### Added

- `packages/penumbra` — the portable half of the design system, and the first thing this repository existed to extract.

## 2026-09-15, the shell

### Added

- `umbra` and `antumbra` entered by `git subtree`, with their history: 378 and 23 commits, both reachable to the initial commit.

### Changed

- one lockfile, and a hoisting boundary that is the package

### Notes

- reading history across the subtree boundary
