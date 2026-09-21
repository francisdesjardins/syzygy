# Changelog

Kept per [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), by date. No semver: names change
between commits when a better one shows up, and the entry says which and why.

> **Frozen 2026-09-21, and condensed to one line per change.**
>
> Decisions live in [`docs/decisions/`](../../docs/decisions/README.md) now — one file per decision, changed
> in place rather than restated on a new date. See
> [0004](../../docs/decisions/0004-the-decision-log-is-the-history.md) for why.
>
> These entries were written as essays, because this file used to be where the reasoning lived.
> The reasoning has moved, so what is left here is the record: what changed, on which date. **The
> full original prose is in this file's git history, at commit 8d295df and earlier.** New entries
> go above this line, one line each.

## 2026-09-18, one switch table, and a frame that does not scroll

### Changed

- the two demos drive their frames the same way

### Fixed

- the frame scrolled where only its log is meant to

## 2026-09-18, the demos show every ending, not just the good one

### Changed

- three conditions on the micro-frontend frame
- one verdict, not a refusal special case
- single-spa says the word, not only the reason

## 2026-09-18, a shared step's timeout was only the owner's

### Fixed

- a sharer adopted the owner's failure, but never its timeout

### Notes

- **guarded** — Two tests in `shared-scope.test.ts`.

## 2026-09-18, the four fragments can lose their session

### Changed

- the micro-frontend demo gains the ending nobody plans for
- the chips say what became of a step, not only who did the work
- `readScope` is `readDemoSearch`

## 2026-09-18, a pass over the package for what had drifted

### Added

- `StepTrace.reason`

### Changed

- the `as` casts are listed, not counted
- one spelling for pruning, and sorted exports

### Removed

- `StepSkippedError`

### Fixed

- `BlockSignal` had lost its documentation
- two public examples read a property that does not exist

## 2026-09-18, a branch that does not apply

### Added

- `ctx.skip(reason?)`

### Changed

- a shared step's skip is everyone's skip
- the demo boots a branch it is meant to go without

### Fixed

- `ready` did not mean what the table said

### Notes

- **guarded** — Three tests in `run.test.ts` — the branch skipped with its dependent pruned behind it, the branch taken, and a _required_ step that skips without failing the run.

## 2026-09-18, `StepStatus` gains `blocked`

### Changed

- the step that refused no longer wears the word for the steps it stopped
- `BlockSignal.blockReason` is `reason`

### Fixed

- the refusing step's status was never reliable

### Notes

- **guarded** — Two tests in `discovered-tiers.test.ts`: the step that refuses reports `blocked` and stays out of `errors`, and a sibling stopped by that refusal reports `cancelled`.

## 2026-09-18, the plan carries its nodes

### Added

- `BootstrapPlan.nodes`

## 2026-09-18, one rule for what a non-`Error` throw is called

### Changed

- shared with antumbra

### Fixed

- a sharer was losing the cause chain

## 2026-09-18, `Session` is `LiveRun`

### Changed

- renamed export

## 2026-09-17, the design-system page becomes "Our skin"

### Changed

- The route is `/skin` and the page keeps what is actually this project's: six colour declarations, the shell's own controls, and the two rules the palette is held to.

## 2026-09-17, the mascot is corona's, the face is ours

### Changed

- `PeekingMoon` — the drifting, the shyness, the eclipse-on-click, 343 lines of it — now comes from [corona](../../corona), along with the drawing it wraps.

## 2026-09-17, the top bar is a path

### Changed

- The bar's brand and its link out are one component now, [corona](../../corona)'s `PlaygroundPath`: `Home / playground / Antumbra · Umbra`.

## 2026-09-17, `normalizeError` is `serializeError`

### Changed

- renamed export

## 2026-09-17, the instruction file gets a budget

### Added

- `yarn doc-budget`, from [gnomon](../gnomon).

## 2026-09-17, the design-system page keeps only what is umbra's

### Added

- A **Layout & stacking** section. corona's gate found that eleven system tokens were on no page in the repository, and these were most of them.

### Changed

- `DesignSystemPage` renders [corona](../corona)'s tables.

### Fixed

- **The token tables showed the outgoing scheme's values after a theme flip, and always had.** The provider writes `data-color-scheme` from an ordinary effect, and React runs a child's effects before its parent's — so the tables measured b...

## 2026-09-17, the skin is twelve declarations

### Changed

- The playground's `<title>` names what the library does — "umbra — bootstrap orchestration over a declared step graph" — rather than the package and the word _playground_.
- `playground/src/app/styles/tokens.skin.css` lost 47 declarations to [penumbra](../penumbra)'s new `tokens.skin.base.css`, and `app.css` imports that file between the system half and this one.

## 2026-09-16, the gates moved to gnomon

### Changed

- `scripts/` lost six files to the `gnomon` package: the example checker, the coverage instrumenter and report, the reset step, and the formatter wrapper.

## 2026-09-15, the package is called `umbra`

### Changed

- `antumbra` → `umbra`, and the dialog manager that was `umbra` is now `antumbra`.

## 2026-09-15, the tokens the two projects share now have an owner

### Changed

- `playground/src/app/styles/tokens.system.css` is gone.

### Notes

- A guard this project never had.

## 2026-09-15, a scope that does not name a browser

### Changed

- `StepScope` said `'page'` and `'app'`.

### Fixed

- - A comment in the scope module read "Not for tagion" — a word left behind when the history was rewritten to remove domain vocabulary, and one that had been sitting in the file since.

## 2026-09-14, the words on screen

### Fixed

- - The outcome and event readouts had been rendering with class names nothing defined since the port — the same loss as the dialog's.

## 2026-09-14, one noun per concept

### Changed

- Everything in the package belongs to one of three things — the **bootstrap** you declared, one **run** of it, one **step** inside that — and the names now say which.

## 2026-09-14, icons, and code that looks like code

### Added

- - An icon set, drawn here rather than installed: nine glyphs on one 24×24 grid, every one a stroke on `currentColor`.

### Changed

- - The eleven `oxlint-disable` comments were re-checked one at a time, by deleting all of them and reading what came back.

## 2026-09-14, the reference in chapters

### Changed

- - The API reference is eleven pages instead of one.

### Fixed

- - Both home-made modals scrolled twice: the sheet and the content inside it.

## 2026-09-14, the playground on a router

### Changed

- - The playground is a routed site rather than one page with a nav that never changed the address.

### Fixed

- - **The code dialog's opener was being called instead of stored.** A React state setter handed a function treats it as an updater, so `setOpen(open)` ran the opener during the provider's render — a state update from inside another compon...

## 2026-09-14, integrating with what exists

### Added

- - A single-spa 6 demo.

### Fixed

- - The graph left its mounted step permanently unresolved.

## 2026-09-14, the typed step list

### Added

- - A `needs` naming a step the list does not contain, and two steps sharing an id, are now **compile** errors.

### Notes

- - Cycles and the preflight-to-mounted edge stay runtime checks, along with everything about a list built dynamically: those have no known positions, so nothing can be claimed about them at compile time. - Long edges in the plan graph rou...

## 2026-09-14, later still

### Added

- - `scope: 'page'` on a step.

### Fixed

- - **The trial warning opened two dialogs.** Two causes, both real.

### Notes

- - A shared step is attempted once and its ending is the page's answer, timeout included — so its `timeout` belongs to the page rather than to whichever module got there first. - Its notices and intents stay with the run that did the work.

## 2026-09-14, later

### Added

- - `antumbra/react` and `antumbra/solid`: `BootstrapProvider`, `useBootstrap`, `useBootstrapContext`, `useBootData`, `useIntentHost`, plus `fromStore` on the Solid side.

### Changed

- - `useIntentHost` returns the forwarded intents instead of taking an `onIntent` callback.

### Fixed

- - `verify:package` matched only single-quoted imports while the bundler emits double, so every check it ran against `dist` passed vacuously.

### Notes

- - No `oxlint-disable` on `react-hooks/exhaustive-deps` anywhere.

## 2026-09-14

### Added

- - `createBootstrap`, `defineStep` and `defineHostedStep`.

### Notes

- - Two `as` casts in shipped source, both at the same boundary: settled data lives in a `Map<StepId, unknown>`, and the step id is what re-attaches the declared type on the way out. - Zero runtime dependencies.
