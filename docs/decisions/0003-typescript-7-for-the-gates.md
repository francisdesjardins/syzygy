# 0003 — TypeScript 7 for the gates, TypeScript 6 for the editor

- **Status**: accepted
- **Scope**: the repository

## Context

[0002](0002-one-toolchain-for-every-workspace.md) asks for one compiler generation. Two things
refuse it.

typedoc peers on `typescript@6.0.x`, and a peer range is not something `resolutions` can shortcut.
And `typescript-7/lib` ships no `tsserver.js`, so an editor cannot run IntelliSense on it.

## Decision

Two TypeScripts, each with a named job.

Every `tsc` call in a `scripts` entry is `node node_modules/typescript-7/bin/tsc`, and oxlint's
type-aware half runs through tsgolint, which is built on the same TS 7 compiler. **The linter and
the type checker are one generation**, which is the property that matters.

The bare `typescript` 6.0.3 is typedoc's and the editor's.

## Consequences

IntelliSense stays a generation behind the gates. `options.typeAware` in `.oxlintrc.json` covers
most of that cost — the linter reports in the editor what the older language service cannot see.

Collapsing to one TypeScript means replacing typedoc. That is tracked as a compatibility row with
its blocker and the date it was last re-measured, not as a wish.
