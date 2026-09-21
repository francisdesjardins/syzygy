# 0026 — A failure is a status, a bug is a throw

- **Status**: accepted
- **Scope**: umbra

## Context

A step threw. The orchestrator has to decide what `run()` does about it, and there are two coherent
answers: reject the promise, so a caller's `try`/`catch` sees it, or resolve with a result that
records what happened.

Rejecting is the reflex. It is also wrong here, and for a reason that is specific to booting rather
than general.

## Decision

**`run()` never rejects because a step failed.** It resolves with an outcome whose statuses say what
happened, and the caller reads them.

**Programming errors do throw, and they throw at construction**: a cycle in the graph, an unknown
id in `needs`, a duplicate id. Those are not conditions a running application can be in — they are
mistakes in the declaration, and the earliest possible moment is the right one.

**`run()` memoises its promise**, and so does `live.attach()`.

## Consequences

An application boots once, and what it needs afterwards is the _whole_ picture — which steps ran,
which were skipped and for which of the three reasons ([0019](0019-skipped-covers-three-endings.md)),
what degraded, what the surviving steps produced. A rejection carries one error and discards all of
it, so every caller would immediately rebuild the outcome from the side channel that still had it.

So the split is: **a failure is data about the boot; a bug is an exception about the code.** Anything
a deployment can legitimately be in is a status.

Memoising matters for the same reason twice over. A framework re-attaches its host far more often
than an author expects, and a hosted phase that ran twice would ask the user the same question
twice — so `attach` is memoised for correctness, not for speed.

The run-level consequence of a failed status is [0018](0018-a-required-failure-stops-the-run.md).
