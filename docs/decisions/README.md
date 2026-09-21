# Decisions

Why this repository is shaped the way it is. One file per decision, numbered in the order they were
written down, each one readable on its own.

**A decision is changed, not appended to.** When one reverses, its `Status` becomes
`superseded by NNNN` and the successor is written beside it. The current state is readable without
reading the history — which is the whole difference from the dated CHANGELOGs, where knowing where
one decision landed meant replaying fifty-one days in order. [0004](0004-the-decision-log-is-the-history.md)
is that decision, and the CHANGELOGs are frozen where they stood.

There is no gate over this directory. `check-doc-budget.mjs` already walks every `CLAUDE.md` and
resolves every link it finds, so a reference that rots fails a gate that already existed.

## The repository

| #                                                      | Decision                                                | Status   |
| ------------------------------------------------------ | ------------------------------------------------------- | -------- |
| [0001](0001-nothing-here-is-published.md)              | Nothing here is published                               | accepted |
| [0002](0002-one-toolchain-for-every-workspace.md)      | One toolchain for every workspace                       | accepted |
| [0003](0003-typescript-7-for-the-gates.md)             | TypeScript 7 for the gates, TypeScript 6 for the editor | accepted |
| [0004](0004-the-decision-log-is-the-history.md)        | The decision log is the history                         | accepted |
| [0005](0005-a-rule-without-a-gate-is-a-preference.md)  | A rule without a gate is a preference                   | accepted |
| [0006](0006-gates-measure-the-artifact.md)             | Gates measure the artifact, not a declared list         | accepted |
| [0007](0007-one-lockfile-and-the-hoisting-boundary.md) | One lockfile, and the hoisting boundary is the package  | accepted |
| [0008](0008-no-component-library.md)                   | No component library anywhere                           | accepted |
| [0009](0009-the-playgrounds-are-dogfood.md)            | The playgrounds are dogfood, the site is the showcase   | accepted |
| [0010](0010-coverage-is-a-local-command.md)            | Coverage is a local command, not a CI job               | accepted |
| [0011](0011-what-is-deliberately-different.md)         | What is deliberately different                          | accepted |
| [0022](0022-the-shared-surface.md)                     | The shared surface, and what holds each part            | accepted |

## antumbra

| #                                             | Decision                                                 | Status   |
| --------------------------------------------- | -------------------------------------------------------- | -------- |
| [0012](0012-the-core-reaches-no-framework.md) | The core reaches no framework                            | accepted |
| [0013](0013-two-kinds-of-binding.md)          | Two kinds of binding, and the difference is load-bearing | accepted |
| [0014](0014-headless-first.md)                | Headless-first: zero shipped UI                          | accepted |
| [0015](0015-actions-are-declared-by-use.md)   | Actions are declared by use                              | accepted |
| [0016](0016-modality-is-a-fact.md)            | Modality is a fact, priority is a policy                 | accepted |
| [0017](0017-compatibility-facts-are-data.md)  | Compatibility facts are data, not prose                  | accepted |

## umbra

| #                                                | Decision                                | Status   |
| ------------------------------------------------ | --------------------------------------- | -------- |
| [0018](0018-a-required-failure-stops-the-run.md) | A required step's failure stops the run | accepted |
| [0019](0019-skipped-covers-three-endings.md)     | `skipped` covers three endings          | accepted |

## penumbra, limb

| #                                      | Decision                                                  | Status   |
| -------------------------------------- | --------------------------------------------------------- | -------- |
| [0020](0020-one-contrast-threshold.md) | One contrast threshold, and it is the one you can look up | accepted |

## apps/home

| #                                   | Decision            | Status   |
| ----------------------------------- | ------------------- | -------- |
| [0021](0021-who-the-site-is-for.md) | Who the site is for | accepted |

## Writing one

Nygard's shape, trimmed to what gets read: **Context** (the forces, including the option not
taken), **Decision** (what holds now, in the present tense), **Consequences** (what this costs, and
what it makes impossible). A `History` section only when the decision moved and the trail explains
something.

Two things keep these worth reading. **State the cost** — a decision with no consequence section is
a preference. And **give the number** where there is one; the sentence that survives a year is the
one with a measurement in it.
