# 0007 — One lockfile, and the hoisting boundary is the package

- **Status**: accepted
- **Scope**: the repository

## Context

Yarn 4 is vendored in `.yarn/releases` and pinned by `packageManager`, so every contributor and
every gate runs the same resolver — `node .yarn/releases/yarn-4.18.0.cjs <cmd>`.

A monorepo then has to answer where a dependency is allowed to be found from.

## Decision

One `yarn.lock` at the root is authoritative. Pins go in `resolutions`; npm's `overrides` is
ignored and must not be added.

`installConfig.hoistingLimits` puts the boundary at the package, so a workspace resolves what its
own manifest declares and not what a sibling happened to install.

## Consequences

**The published dependency list is the manifest**, so anything a demo needs belongs in that
playground's `package.json` and never in the library's, whose `dependencies` stay empty. A library
that works only because its playground installed something is a library that is broken for everyone
else.

The boundary is asymmetric, and the manifest comment says why rather than leaving the asymmetry to
look like an oversight. `yarn constraints` holds it.

Peer ranges are the requirement, not this repo's `devDependencies`, which sit far above them.
Quoting a dev pin as the requirement asks for more than the package does.
