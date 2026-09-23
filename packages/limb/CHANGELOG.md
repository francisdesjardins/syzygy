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

## 2026-09-17, the two hardest modules had the thinnest tests

### Added

- A real `check`.

### Changed

- `single-flight` went from 3 tests to 19, `mutex` from 3 to 12, and the package from 59 to 84.

### Fixed

- A rejected **promise** handed to `createMutex` while the chain was busy was reported as an unhandled rejection by the runtime before the chain ever reached it — the only handler was the gate's, and the gate may not open for several turns...

### Notes

- **documented, not fixed** — **The mutex is not reentrant**: calling it from inside a task deadlocks both halves, silently and forever — the outer task awaits the inner, which awaits the gate, which awaits the outer.

## 2026-09-16, four primitives that were never shared at all

### Added

- `mutex`, `single-flight`, `shallow-equal` and `slice-declaration` — 235 lines, and the 24 tests that came with them.

### Notes

- and the reason is one function

## 2026-09-16, the three that had not drifted

### Added

- `color-contrast`, `fuzzy-match` and `readable-syntax`, with the 35 tests that came with one of the two copies.

### Notes

- Seven modules sat at `shared/lib` on both sides.
- `useDocumentTitle` diverges by exactly one line — a product-name constant — and is the most tempting file in either playground.
