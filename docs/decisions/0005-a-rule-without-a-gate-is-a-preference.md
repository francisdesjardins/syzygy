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

**A gate is not free, and some of them have not earned their keep.** `doc-budget` is the worked
example: the first time it bound, the answer was to raise its ceilings, because the numbers were
snapshots of a smaller day rather than targets. A gate whose only effect is to be relabelled taxes
every sentence written under it. Prefer gates that read the artifact over gates that compare a
number to a number somebody wrote down.
