# 0005 — A rule without a gate is a preference

- **Status**: accepted
- **Scope**: the repository

## Context

This repository states a lot of rules: about comments, tokens, casts, imports, contrast, layout,
which files may reach a framework. A rule written in a `CLAUDE.md` and nowhere else survives
exactly as long as the attention of whoever read it last.

## Decision

Every rule names the thing that fails when it stops being true. Shared gates live in `gnomon` and
are its `bin` entries — that list **is** the set of shared gates, so there is no second register of
them to fall out of step.

`yarn check:gates` derives which gates a workspace owes from `gnomon`'s `bin` and the workspace's
own content. A manifest opts out with `gates.skip` and a reason, and that is the only exit.

## Consequences

Adding a gate to `gnomon` makes it owed everywhere it applies, at once, without visiting eight
manifests. Adding a rule without a gate is allowed and honest, as long as it is written as a
preference rather than as a rule.

The corollary about what a gate is allowed to read is [0006](0006-gates-measure-the-artifact.md).

**A gate is not free**, and the number inside one is where the cost hides. Three kinds, and only
one of them rots:

**A floor guards the gate against itself.** `comment-budget.json` asserts a minimum — so many
blocks across so many files — because the worst failure a scanner has is finding nothing and
reporting success. A floor is passed by a wide margin and only ever fails when code genuinely went
away, which is a thing worth being told. It does not rot.

**A ceiling is a policy, and only works if it was chosen as one.** `doc-budget`'s numbers were
first set to what each document happened to weigh, rounded up, so they read 89% from their first
commit and the gate's whole effect was to tax the next sentence. They were raised deliberately
on 2026-09-21, to put today's content near 80%, with the search for fat that preceded it written
into the file — 44 words of restatement found in 12 977, and no over-written section. The ceiling
is worth keeping because the cost it controls is real: a `CLAUDE.md` is paid for on every task
forever. It is worth keeping **as a decision about what that is worth**, never as a snapshot of
what it currently is.

**A gate that reads the artifact is the kind to prefer**, and the same command carries one: on top
of the word counts, `doc-budget` resolves every link and every named script in every `CLAUDE.md`.
That half cannot be satisfied by editing a number, which is why the decision log needs no gate of
its own — see [0006](0006-gates-measure-the-artifact.md).
