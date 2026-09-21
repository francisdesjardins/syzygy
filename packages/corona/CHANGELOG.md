# Changelog

Kept per [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), by date. No semver.

> **Frozen 2026-09-21, and condensed to one line per change.**
>
> Decisions live in [`docs/decisions/`](../../docs/decisions/README.md) now — one file per decision, changed
> in place rather than restated on a new date. See
> [0004](../../docs/decisions/0004-the-decision-log-is-the-history.md) for why.
>
> These entries were written as essays, because this file used to be where the reasoning lived.
> The reasoning has moved, so what is left here is the record: what changed, on which date. **The
> full original prose is in this file's git history, at commit 8d295df and earlier.** New entries
> go above this line, one line each.

## 2026-09-19, the highlighter's declarations travel with it

### Fixed

- corona's ambient types did not reach corona's consumers

## 2026-09-18, one code block, and two bugs it was hiding

### Added

- `corona/code`

### Fixed

- a code surface that had drifted off the token
- a block that rendered plain text and said nothing

## 2026-09-18, the whole shell is corona's

### Added

- `AppShell`

### Fixed

- a drawer that arrived a frame late on every phone load

## 2026-09-18, corona has no barrel, and now has a CLAUDE.md

### Added

- `CLAUDE.md`, and a budget for it

### Removed

- the `.` export

## 2026-09-18, one card surface, and it is the one with the arguments

### Added

- `SurfaceCard`

## 2026-09-18, the top bar is corona's, and the mark is the only thing it asks for

### Added

- `TopBar`

## 2026-09-18, `PageLayout` is corona's, and the slot it was going to need is not

### Changed

- antumbra's copy is gone

## 2026-09-18, the three are in the order of the eclipse

### Changed

- `PLAYGROUNDS` runs umbra, penumbra, antumbra

## 2026-09-18, the way out is the menu's first group

### Changed

- `SiteLinks` is gone.

### Fixed

- The pinning that made this necessary is also gone, along with the `margin-top: auto` that only worked in one of the three shells.

## 2026-09-18, the drawer is one drawer

### Added

- `Sidebar` — the navigation drawer, taking the host's `NAV_GROUPS` and nothing else.

## 2026-09-18, the icon sets collapse

### Added

- `corona/icons` — the fourteen glyphs every playground draws.

## 2026-09-17, the shell moves here, and the way out becomes three marks

### Added

- `src/theme/`
- `PageLayout`
- subpath exports

### Changed

- `SiteLinks` replaces `PlaygroundPath`

## 2026-09-17, the shell primitives move here

### Added

- `src/shell/` — `AppButton`, `AppIconButton`, `appButtonClass`, `SelectionDropdown`, `SectionNav` and `useDocumentTitle`.

## 2026-09-17, the mascot moves here, and its face does not

### Added

- `PeekingMoon` — the behaviour — and `EclipseMoon`, the drawing.

## 2026-09-17, the way out becomes a path

### Added

- `PlaygroundPath` — `Home / playground / Antumbra · Umbra`, where the current one carries this project's mark and the others are links.

### Fixed

- Below 900px the bar keeps only the segment saying where you are.

## 2026-09-17, the stacking table said the opposite of the sheet

### Added

- `check-token-coverage.mjs` now holds that group in ascending order, reading each value out of penumbra's sheet.

### Fixed

- `SYSTEM_GROUPS.stacking` listed the mascot last, which on a design-system page reads as the topmost layer.

## 2026-09-17, the site link collapses on a phone

### Fixed

- **`SiteHomeLink` was pushing the theme toggle off the top bar at 360px**, on every route of one playground.

## 2026-09-17, the design-system tables become the third area

### Added

- `src/tokens/` — `TokenSwatches`, `TokenScale`, `useTokens`, `SYSTEM_GROUPS` and one stylesheet.
- the table of contents is checked
- `isOnSite`

### Fixed

- **The tables read the outgoing scheme's values on a theme flip, in one of the two playgrounds.** `useTokens` took the scheme from the host's context and re-read when React said it changed.

## 2026-09-17, the reference becomes an area rather than the package

### Changed

- Everything moved under `src/api/`, which owns its own barrel.

## 2026-09-16, the reference stops existing twice

### Added

- The API reference viewer and the contract it reads: 25 files out of each playground's `pages/api`, and the four model types that had been declared once per generator.

### Notes

- Before any of this, 15 of 25 files were byte-identical between the two playgrounds and 8 more differed by a single import line — the virtual module, named after its library on one side.
- **A second copy of `@tanstack/react-router`.** Each workspace group is its own hoisting boundary, so this package resolves its own.
