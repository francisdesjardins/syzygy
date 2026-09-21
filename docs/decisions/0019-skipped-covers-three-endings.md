# 0019 — `skipped` covers three endings, and only one carries a reason

- **Status**: accepted
- **Scope**: umbra

## Context

A step that did not run reports `skipped`. Three different things produce that status, and they are
not the same fact:

1. **The step decided.** `ctx.skip(reason?)` — the step looked at the world and declined. It
   carries a `reason`.
2. **A need did not succeed.** The step was never eligible.
3. **The run had already stopped.** The step was eligible and never reached, per
   [0018](0018-a-required-failure-stops-the-run.md).

## Decision

One status, because to everything downstream the three are identical: the step did not run and
produced no value. Splitting them into three statuses would push that distinction into every
consumer that only ever needed the one bit.

**Only the first carries a `reason`**, because only the first has one to give. The other two are
facts about the graph and the run, recoverable from the trace and the timeline.

## Consequences

Anything that explains a skip to a human must **derive** the difference rather than read it off the
status. The rule: if the trace carries a reason, that is the answer; otherwise check the step's
needs against the timeline — if one of them did not succeed, it is ending 2; if they all succeeded,
it is ending 3.

That derivation is a pure function with its own tests, not a conditional inside a view, because
getting it wrong produces a label that is confidently false — which is exactly what happened before
it existed.

`StepSkippedError` was removed: an ending is not an exception, and modelling one of the three as a
throw made the other two look like a different kind of event.
