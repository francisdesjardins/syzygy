# 0023 — Parallelism is derived, never declared

- **Status**: accepted
- **Scope**: umbra

## Context

A bootstrap orchestrator is asked for two knobs almost immediately: a `parallel` flag on a step, and
a concurrency cap on the run. Both are easy to add and both look like control.

## Decision

Neither exists. Steps list what they read in `needs`, and the planner turns that into topological
levels; everything on a level goes out together.

**A cap would make `plan()` lie.** `plan()` is the promise that you can see what a run will do
before it does it — with a cap, it describes something other than what ran, and the one artefact
that was supposed to be trustworthy becomes an approximation.

## Consequences

Making two steps run in sequence is done the only honest way: one of them declares that it needs the
other. The dependency is then true in the graph, in the plan and in the run, rather than being a
scheduling hint that the graph does not know about.

**`plan()` returns levels, not waves.** It is a static analysis of the graph, computed before
anything runs. `outcome.timeline` is what actually happened, and **the two are allowed to differ** —
a level is what _could_ go out together, a timeline is what did. Reading the plan as a prediction of
timing is the one misreading to guard against; it is a prediction of _order_.

The cost is a real one to name: a run with forty independent steps opens forty at once, and this
package will not throttle that for you. If a resource needs protecting, the protection belongs to
the resource — a queue or a semaphore inside the step — where it is visible, rather than in a
scheduler flag that quietly changes what every plan means.

What happens when one of them fails is [0018](0018-a-required-failure-stops-the-run.md).
