# 0022 — The shared surface, and what holds each part

- **Status**: accepted
- **Scope**: the repository

## Context

The point of this repository is to combine and normalise everything that is genuinely shared. The
list of what has actually been unified is worth writing down once — not as a measurement, which
rots, but as a map from a shared thing to **the gate that fails when it stops being shared**.

A row with no gate in its third column would be a preference, per
[0005](0005-a-rule-without-a-gate-is-a-preference.md). There are none.

## Decision

| What                      | Where it lives                           | What holds it                                           |
| ------------------------- | ---------------------------------------- | ------------------------------------------------------- |
| Lint rules                | `.oxlintrc.json`, each workspace extends | `yarn lint` at the root, over every file                |
| Formatting                | `.oxfmtrc.json`, one for the tree        | `yarn format:check` at the root, over every file        |
| TypeScript strictness     | `tsconfig.base.json`, each extends       | each workspace's `type-check`                           |
| Type-only imports         | `tsconfig.base.json`, all 13 configs     | `type-check`, and `docs:examples` for the snippets      |
| Script bodies             | each manifest, checked against the rest  | `yarn constraints` — one name, one command              |
| Dependency versions       | one range per ident                      | `yarn constraints` — one version per dependency         |
| A workspace being seen    | every workspace has `check` and `test`   | `yarn constraints` — an explicit no-op counts           |
| The hoisting boundary     | `installConfig.hoistingLimits`           | `yarn constraints`, asymmetric and commented            |
| Design tokens             | `penumbra`                               | `check-tokens.mjs`, both halves, both directions        |
| Colour contrast           | `penumbra`                               | `penumbra-contrast`, 32 pairs × both schemes            |
| The token tables          | `corona`                                 | `check-token-coverage.mjs` — every token is on a page   |
| The API reference viewer  | `corona`                                 | antumbra's and umbra's smoke suites                     |
| The way back to the site  | `corona`                                 | `yarn check:layout`                                     |
| Framework-free helpers    | `limb`                                   | its entry rule: if it needs a framework, it is not limb |
| The gates themselves      | `gnomon`                                 | `yarn check` in each consumer                           |
| Agent-instruction budgets | `gnomon-doc-budget`                      | `yarn doc-budget`, a ceiling and a headroom line each   |
| Tokens that are read      | `gnomon-token-usage`                     | `check:tokens:used` in all five consumers               |
| The capability list       | `deploy.mjs` is the source               | `yarn check:capabilities`, four places held to agree    |
| Layout at four widths     | —                                        | `yarn check:layout`, 19 routes × 4 widths               |
| The stacking scale        | `penumbra/tokens.system.css`             | `check-tokens.mjs` — no two layers share a number       |
| The playground shell      | `corona/shell`, `/theme`, `/mascot`      | each playground's `verify:all`, and `yarn check:layout` |
| The way between them      | `corona/site` — one table of three       | `yarn check:layout`, 19 routes × 4 widths               |

## Consequences

This is a map, not an inventory, and it carries no "last measured" date on purpose. A dated
register is a claim about a moment, and the moment passes — which is exactly how the file this
replaces came to be stale.

**The gate is the record.** If a row here disagrees with what a gate does, the gate is right. What
each workspace owes is derived by `yarn check:gates` from `gnomon`'s `bin` plus the workspace's own
content, so this table cannot silently fall behind the set of gates that exist.

The other half — what was looked at and deliberately **not** unified — is
[0011](0011-what-is-deliberately-different.md). Both halves are needed: without the second, the
cheapest way to look thorough is to unify something that should not be.
