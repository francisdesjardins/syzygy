# 0027 — One word means one thing, and there are no abbreviations

- **Status**: accepted
- **Scope**: umbra, antumbra

## Context

Both packages reached a point where a single word carried two jobs. In umbra, `phase` meant either
`preflight`/`hosted` **or** where a run had got to, so `snapshot.phase` and `step.phase` were not
asking the same question. `Outcome` was both the object a run produced and how one step ended, so
`outcome.timeline[0].outcome` put one noun at two ranks.

Nothing is published ([0001](0001-nothing-here-is-published.md)), so a rename costs the call sites
and nothing else.

## Decision

**A word means one thing.** `phase` is `preflight` or `hosted`; a run's position is a `stage`.
`Outcome` is what a run produced; how a step ended is a `status`. The three lifecycle enums are one
family and read the same way: `RunStatus`, `StepStatus`, `IntentStatus`.

**No abbreviations.** There is no `Boot` prefix — a short `Bootstrap` on types that mostly describe
a run puts three prefixes on one concept.

**A name that belongs to the application is not available to the library.** `Session` became
`LiveRun` because consumers declare their own `session` step — this package's own examples do — so
the collision was permanent rather than unlucky.

## Consequences

The rename is the cheap half. The expensive half is noticing, and noticing is the whole point:
these were found by reading the surface aloud, not by a tool, and no gate can find the next one.

**A better word is applied the day it is found**, with its call sites, in one commit. Anything else
leaves two vocabularies in the tree and a reader who has to know which era a file is from.

## History

Both packages went through this, and the tables live in the frozen archives rather than here.

- **2026-09-14** — umbra, [_one noun per concept_](../../packages/umbra/CHANGELOG.md):
  `RunPhase` → `RunStage`, `StepOutcome` → `StepStatus`, `IntentCollector` → `IntentQueue`, and the
  `Boot` prefix dropped. `Session` → `LiveRun` followed, with `boot.session()` → `boot.live()`.
- **2026-09-15** — antumbra, renamed as a package for the second time, and its API with it:
  `useModal` → `useDialog`, `useSlideModal` → `useSlideDialog`. Entries written before that date
  call it `umbra`, and ones before 2026-08-04 call it `@yourorg/dialog`. **Searching the archive for
  a current name finds nothing**, which is the standing cost of having done this right.
