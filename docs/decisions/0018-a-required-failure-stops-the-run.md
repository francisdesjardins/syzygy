# 0018 — A required step's failure stops the run

- **Status**: accepted
- **Scope**: umbra

## Context

A bootstrap plan is a graph: each step declares what it needs, and umbra schedules what is ready.
When one step fails, there are two defensible policies. Drain the graph — keep running everything
whose own needs still succeeded — or stop.

The difference is invisible until something fails, and then it is the whole behaviour.

## Decision

**A required step's failure stops the run.** The run's status becomes `failed`, and nothing further
is scheduled, including steps whose own needs all succeeded.

A step marked `optional: true` is the exception: its failure is tolerated, the run's status becomes
`degraded`, and scheduling continues.

## Consequences

This is the part that reads as a bug and is not. If `access` fails and `debug-overlay` needs only
`config`, which succeeded, `debug-overlay` is still reported `skipped` — not because its own
dependency failed, but because **the run had already stopped** before its turn came. Change which
step fails and the picture inverts, for the same reason: what survives is whatever was already
scheduled when the stop happened, not whatever the graph would have allowed.

An application boots or it does not. Half-booting past a failed requirement produces a state nobody
designed, and the cost of that state is paid later, by somebody debugging a screen that should
never have rendered. `optional` is how a step says it is not part of that guarantee.

The reporting consequence is [0019](0019-skipped-covers-three-endings.md), and it is not
cosmetic — the plan graph in the playground once labelled this case _"a need did not succeed"_,
which was false, and the falsehood was only visible to someone reading the graph against the
config.
