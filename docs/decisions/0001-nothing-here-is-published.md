# 0001 — Nothing here is published

- **Status**: accepted
- **Scope**: the repository

## Context

Several packages look publishable. They have entry points, `exports` maps, declaration builds and
a `verify:package` gate that checks the built artifact. `private: false` sits in more than one
manifest. Everything about the shape says "library on a registry".

None of it is on one, and none of it is going to be.

## Decision

Nothing in this repository is published to npm or any other registry. There is no semantic version
to respect, no release ceremony, and no consumer pinned to an older shape.

## Consequences

**Always take the best solution, never the backwards-compatible one.** A rename is a rename. A
better API replaces the worse one in the same commit that finds it, with the call sites moved.
There is no deprecation period because there is nobody to deprecate for.

`private: false` means nothing here. It is not a promise, and it should not be read as one.

The packaging gates stay anyway, for a reason that is not publication: they are the test that the
entry points resolve without a framework, which is [0012](0012-the-core-reaches-no-framework.md).
`verify:package` checks the built artifact because a `.d.ts` that only works in this repo's
`tsconfig` is a defect whether or not anyone installs it.

It also means a CHANGELOG cannot be a migration guide, which is what
[0004](0004-the-decision-log-is-the-history.md) is about.
