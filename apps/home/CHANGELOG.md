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
> full original prose is in this file's git history, at commit ab066b7 and earlier.** New entries
> go above this line, one line each.

## 2026-09-19, three i18n packages for twenty-one strings

### Changed

- a key that does not exist no longer compiles

### Removed

- `i18next`, `react-i18next`, `i18next-browser-languagedetector`

### Fixed

- `<html lang>` had three values for two languages

## 2026-09-19, no router, and no blank page under a 200

### Removed

- `react-router-dom`

### Fixed

- every path but `/` rendered nothing

## 2026-09-19, fifteen strings from a site that no longer exists

### Removed

- dead translations, in both languages

## 2026-09-18, two things that were sections and are not

### Changed

- the location is a byline
- the development note is attached to what it is about

## 2026-09-18, the three projects are the card the playgrounds are made of

### Changed

- the page's one action looks like one
- `SurfaceCard` moved out of `corona/shell`

## 2026-09-18, the name is set in the face the rest of the site uses

### Fixed

- the front door was the one page with no typography of its own

## 2026-09-17, the site drops MUI

### Removed

- `@mui/material`, `@mui/icons-material` and the two emotion packages.

## 2026-09-17, the design system leaves the site

### Changed

- `check:contrast` measures this site's own skin and nothing else; the two example skins are measured where they are shown.

### Removed

- `/design-system`, its page, the two example skins and the specimen stylesheet.

## 2026-09-17, building blocks, and the head says so too

### Added

- `yarn check:head` — the head, the application's `seo.home.*` and the token sheet have to agree.

### Changed

- The page called this front-end work.
- the robot half says the same thing
- the manifest

## 2026-09-17, the palette stops being MUI's

### Added

- `yarn check:literals` — a hexadecimal in `src/**/*.tsx` fails the check.
- the preview resets what it does not own

### Changed

- `src/styles/tokens.skin.css` is the palette now — eleven declarations, three typefaces and the eight colours this site paints itself with — over `penumbra/tokens.skin.base.css`, which `main.tsx` imports between the system half and it.
- what moved on screen

## 2026-09-17, a second page, and two palettes that are not this site's

### Added

- `/design-system` — penumbra taken apart, with a switch over three layerings of one specimen: the base alone, an eleven-declaration tint over it, and a skin that replaces the base outright.
- the palettes are measured

### Changed

- `/` is no longer the only route, so `App` splits: the landing page stays in the entry chunk, where a second round trip before first paint would be paid by every visitor, and `/design-system` is lazy. penumbra joins the two playgrounds in...

## 2026-09-16, the front door moves in

### Added

- The homepage of francisdesjardins.ca, carried over from its own repository at `b07d934`: 17 files and 1090 lines, which is the route's real closure rather than a guess at it.

### Changed

- The six `@mui/material` barrel imports became per-module ones.

### Fixed

- `useDocumentHead` asserted `document.querySelector(…) as HTMLMetaElement`, twice.

### Notes

- **`tokens.system.css` was a third copy of [penumbra](../../packages/penumbra).** Not a near-copy: across 93 lines, every declaration matched.
- The old build was fingerprinted before a file moved, and the fingerprint is deliberately wider than a screenshot: the full DOM tree under `#root` with 35 computed properties on every element, every meta tag, every hand-written head link,...
