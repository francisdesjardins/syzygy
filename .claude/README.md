# Agent tooling

Skills, commands and settings for working on this repository with Claude Code. **They live at the
root because that is where they are found** — these five skills spent the time since the monorepo
import inside `packages/antumbra/.claude/`, where a session rooted at `syzygy` never saw them.

## Skills

Four of them are not about any one package, which is why they are here rather than beside one.

| Skill              | What it answers                                                                    | Needs                    |
| ------------------ | ---------------------------------------------------------------------------------- | ------------------------ |
| `dom-probe`        | What did the page actually render — what is under this point, what did a click hit | a URL                    |
| `chrome-cdp`       | Which CSS rule won this property, and which ones lost to it                        | a Chrome already running |
| `wcag-audit`       | Contrast and keyboard-focus reachability, on the page as it renders, both schemes  | routes to walk           |
| `playground-smoke` | Every route of a playground boots without a console error, and the flows work      | a running playground     |
| `dialog-debug`     | What a dialog actually paints — trajectory, box, teardown                          | antumbra's playground    |

`dialog-debug` is antumbra's. The other four should be reached for from any package, and
`wcag-audit` in particular belongs to whoever is touching colour — which is usually `penumbra` or
the site, not the package it used to live under.

None of them needs installing: the two that drive a browser speak CDP over Node's own `WebSocket`,
and Playwright is hoisted to the root.

## Commands

`antumbra-add-example` and `antumbra-store-engineer` are both antumbra's, and carry its name because
a command list is flat.

## Settings

**On every edit**, `oxfmt` formats the file that was written. Formatting is not a thing to spend
attention on, and the repository has one formatter ([0002](../docs/decisions/0002-one-toolchain-for-every-workspace.md)).

**Nothing runs when a turn ends**, and that is a change from what antumbra's copy did. It ran a type
check, a lint and a documentation-budget test after every turn. Three problems: the budget test was
replaced by `yarn doc-budget` and the hook still asked Playwright for it by name, so it failed on
every turn against a test that no longer existed; `tsc -p tsconfig.json` means something different
from the root than it did from inside a package; and running a whole workspace's checks after each
turn is the opposite of scoping validation to what changed. `yarn check` is the gate, run
deliberately, on the workspace that moved.

**The deny list** is the part worth having at the root rather than in one package: it refuses the
handful of commands that cannot be undone, and reading anything that looks like a credential.
