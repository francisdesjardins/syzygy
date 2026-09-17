# Changelog

Kept per [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), by date. No semver.

## 2026-09-17, the agent-instruction budget joins the gates

### Added

`gnomon-doc-budget` — a word budget per `CLAUDE.md`, plus the checks that keep such a document from
lying: every `CLAUDE.md` in the package is budgeted (discovered by walking, not by a hand-kept list),
every budgeted path still exists, every link resolves, and every `` `yarn <script>` `` it names is a
real script. Read from the package that ran it, like everything here: `doc-budget.json` beside the
manifest.

It was antumbra's Playwright test. umbra had none of it, at 3 484 unbudgeted words — the same
asymmetry `penumbra-contrast` closed for colour.

**The new part is a second line under the ceiling.** A ceiling alone does not stop a document
arriving at 99% and staying there: antumbra's set sat at 13 498 words of 13 500, because each budget
had been set to the file's size on the day it was written. A budget fitted to the document is a
snapshot, not a budget — it reads full from the first commit, and every session after pays a word
hunt before it can add a sentence. Crossing 90% now fails, and the fix is a trim or a raise, where a
raise is a decision stated in the commit.

The **total** stays a hard ceiling with no headroom taken off it. It already sums tighter than the
per-file budgets on purpose, and applying the fraction twice would make the real limit a number
nobody chose.

All six checks were proved lethal by mutation.

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
