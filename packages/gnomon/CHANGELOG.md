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

## 2026-09-17, a token nothing declares

### Added

- `gnomon-token-usage` — every `var(--app-…)` names a token something declares. corona's `check-token-coverage` runs the other way: it fails on a token nothing _shows_.

## 2026-09-17, the agent-instruction budget joins the gates

### Added

- `gnomon-doc-budget` — a word budget per `CLAUDE.md`, plus the checks that keep such a document from lying: every `CLAUDE.md` in the package is budgeted (discovered by walking, not by a hand-kept list), every budgeted path still exists, e...

## 2026-09-16, one copy of the gates

### Added

- Six files that existed twice, one copy per library, now live here: the JSDoc example checker, the component-coverage instrumenter and its report, the reset step that empties `.nyc_output/`, and the formatter every generator shares. 891 l...

### Changed

- the binding list is derived, not written
