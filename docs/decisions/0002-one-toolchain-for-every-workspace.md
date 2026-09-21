# 0002 — One toolchain for every workspace

- **Status**: accepted
- **Scope**: the repository

## Context

The point of this repository is to combine and normalise what is genuinely shared. Development
tooling is the easiest thing to let drift: each workspace gets its own linter config, its own
formatter, its own compiler pin, and within a year no two packages are judged by the same rules.

A rule that is a preference in each workspace is not a rule.

## Decision

Devtools are one decision, not seven. Every workspace runs oxlint with its type-aware half on
tsgolint, oxfmt, and TypeScript 7 — the same versions, held by a dependency constraint.

There is no eslint and no prettier anywhere in the tree, and no workspace is on an older compiler
than the linter that judges it.

## Consequences

Each workspace's config `extends` a root one rather than restating it: `.oxlintrc.json`,
`.oxfmtrc.json`, `tsconfig.base.json`. `yarn constraints` holds one version per dependency ident,
so a workspace cannot quietly move ahead.

One duplication survives and is the tool's, not a choice: `ignorePatterns` is written out five
times because oxlint does not inherit it through `extends` — not even into a child that declares
none, measured against 1.83.0. The comment in each file says so.

The compiler split this forces is [0003](0003-typescript-7-for-the-gates.md).
