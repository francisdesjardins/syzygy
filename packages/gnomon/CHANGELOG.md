# Changelog

Kept per [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), by date. No semver.

> **Everything below this line is frozen, 2026-09-21.**
>
> Decisions live in [`docs/decisions/`](../../docs/decisions/README.md) now — one file per decision, changed
> in place rather than restated on a new date. See
> [0004](../../docs/decisions/0004-the-decision-log-is-the-history.md) for why.
>
> These entries are left exactly as written: a changelog that edits its own past is a story,
> not a record. They are the archive a decision's history points back into. New entries go
> above this line, one line each, naming the decision they carry out.

## 2026-09-17, a token nothing declares

### Added

`gnomon-token-usage` — every `var(--app-…)` names a token something declares.

corona's `check-token-coverage` runs the other way: it fails on a token nothing _shows_. This one
fails on a name nothing _declares_, and the difference is what a browser does with each. An
undocumented token is invisible to a reader; an undeclared one resolves to nothing at all, so the
property falls back to whatever it inherits and the page renders at a browser default with nothing
anywhere complaining.

That is not hypothetical. `--app-text-4xl` does not exist — the scale stops at `3xl` — and a
heading asking for it shipped in penumbra's new playground rendering at the browser's default size.
Type-check passed, lint passed, the contrast gate passed, and a screenshot is what caught it.

It reads `.css`, `.ts` and `.tsx`, because an inline style names a token that does not exist just as
easily as a stylesheet does. Two floors guard it: a run that read no declaration would call every
usage undeclared, and a run that read no usage would call every sheet clean.

Here rather than in penumbra, which ships two stylesheets and knows nothing about who reads them,
and rather than in corona, whose rule is about the viewer. A gate every workspace runs belongs with
the gates.

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
