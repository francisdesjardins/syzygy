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

## 2026-09-18, four things the specimen got wrong

### Fixed

- **Every skin rendered light.** The scoped sheets carry `[data-penumbra-preview][data-color-scheme='dark']`, and the preview element did not carry the attribute — so the dark half of all three states matched nothing.

## 2026-09-17, penumbra gets a playground

### Added

- `playground/` — a third workspace beside the two libraries', served at `/playground/design`.

## 2026-09-17, a tie in the stacking scale is now a failure

### Added

- **No two `--app-z-*` tokens may share a value**, checked by `check-tokens.mjs`, with a guard beside it that fails if the pattern stops matching the scale.

### Fixed

- `--app-z-mascot` was `30`, the same number as `--app-z-sidebar`, and is now `10`.

## 2026-09-17, the contrast gate comes to the vocabulary

### Added

- `penumbra-contrast` — a bin, moved here from umbra, where it was about to be copied a second time.

### Changed

- umbra's `check:contrast` is the bin now and its script is gone. antumbra gained the same line: its palette had no gate in `yarn check` at all, only a browser audit somebody had to remember to run.

## 2026-09-17, the half of a palette that is not a brand

### Added

- `tokens.skin.base.css` — 24 names across 47 declarations: the surfaces, the three text ranks, the divider, the control edge, the hover and selected states, the four semantics with their washes, the scrim, the scrollbar and `--app-lift`, ...
- the gate runs in both directions now

### Changed

- `umbra`'s `check:contrast` reads the base underneath the skin.

## 2026-09-15, a package, because prose did not hold

### Added

- `tokens.system.css` — scale, rhythm, motion and stacking, with no colour and no typeface in it.
- the split has a gate now

### Notes

- A reference skin.
