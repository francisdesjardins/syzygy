# Changelog

Kept per [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), by date. No semver.

## 2026-09-16, one copy of the gates

### Added

Six files that existed twice, one copy per library, now live here: the JSDoc example checker, the
component-coverage instrumenter and its report, the reset step that empties `.nyc_output/`, and the
formatter every generator shares. 891 lines that were being kept in agreement by hand.

They had not stayed in agreement, and two of the differences were not cosmetic.

**The formatter had a fix on one side only.** `format` hands back the original text with its
diagnostics beside it, so a caller comparing the answer to what it passed in reads an unparsable
`@example` as one that needed no formatting — which is the whole of what the example checker looks
for. One copy raised on parse errors. The other, checking the other library's examples, did not.

**The two coverage reports listed different reasons for finding nothing.** One knew about a run
reusing an already-started, uninstrumented dev server; the other knew about an instrumenter that
changed while `playwright/.cache-coverage/` did not. Each had been written by whoever hit that
failure, in the copy they happened to be in. The merged list carries four.

### Changed — the binding list is derived, not written

The example checker used to name each entry point. That list was the only real difference between
the two copies — one library ends its plain entry `/plain`, the other `/vanilla` — and a list nobody
updates is an entry point that stops being checked with nothing going red. It now comes from the
calling package's own `exports`.
