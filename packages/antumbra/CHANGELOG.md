# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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
>
> **Reading them needs one key**: the package has been renamed twice, so older entries call it by
> older names — `@yourorg/dialog` before 2026-08-04, then `umbra` until 2026-09-15. It is
> `antumbra` now. The API was renamed with it: `useModal` is `useDialog`, `useSlideModal` is
> `useSlideDialog`. Searching the archive for a current name finds nothing.

## 2026-09-19, the draft is written out, and immer is gone

### Added

- `shared/lib/draft.ts`

### Removed

- `immer`

## 2026-09-18, a thrown object no longer says `[object Object]`

### Changed

- what a non-`Error` throw is called

### Fixed

- `normalizeError` could throw

## 2026-09-17, the design-system page becomes "Our skin"

### Changed

- The route is `/skin` and the page keeps what is actually this project's: six colour declarations, the shell's own controls, and the two rules the palette is held to.

## 2026-09-17, the mascot is corona's, the face is ours

### Changed

- `PeekingMoon` — the drifting, the shyness, the eclipse-on-click, 343 lines of it — now comes from [corona](../../corona), along with the drawing it wraps.

## 2026-09-17, the top bar is a path

### Changed

- The bar's brand and its link out are one component now, [corona](../../corona)'s `PlaygroundPath`: `Home / playground / Antumbra · Umbra`.

## 2026-09-17, the instruction set gets room to breathe

### Changed

- The doc budget is [gnomon](../gnomon)'s now — `yarn doc-budget`, the same six checks as the test it replaces plus a headroom line at 90% of each ceiling.

### Fixed

- **`prepare`'s JSDoc and `src/CLAUDE.md` contradicted each other on the word `gate`.** The JSDoc said "a gate, not a notification"; the vocabulary said "`prepare` is awaited, **not** a gate — a gate says no, and `prepare` cannot".

## 2026-09-17, the design-system page keeps only what is antumbra's

### Added

- A **Layout & stacking** section, and `--app-warn` / `--app-warn-wash` joined the semantic list.

### Changed

- `DesignSystemPage` renders [corona](../corona)'s tables.

## 2026-09-17, the palette gets a gate

### Added

- `yarn check:contrast`, from `penumbra-contrast`.

### Changed

- The playground's `<title>` names the capability — "antumbra — headless dialogs on the native top layer" — rather than the package and the word _playground_.

## 2026-09-17

### Changed

- the skin is twelve declarations

## 2026-09-16

### Changed

- the gates moved to gnomon

## 2026-09-15

### Changed

- the package is called `antumbra`
- the system half of the tokens is a dependency, not a copy

### Removed

- one test, to where it can guard both consumers

## 2026-09-14

### Added

- the component suite watches the page for an exception nobody caught

### Changed

- one formatter, and it is oxfmt
- the CI jobs share one setup, and the lint job is as strict as the local gate
- the Solid harness hands its disposer down as a getter
- the CT fixture is named for what it carries

### Removed

- tooling that no longer answers for anything

## 2026-09-09

### Added

- the landing page names what it was already demonstrating
- the dialog's attribute set, asserted as a set

### Changed

- the export gate reads the landing page too
- the modality test holds the property, not the mechanism

### Fixed

- two facts in the README, and a gate for the column that rots
- a Solid harness threw on every disposal, and nothing was watching

### Notes

- **documented** — modality is read once per open, and now something says so

## 2026-09-08

### Changed

- one act, one word, in the core's own vocabulary
- the component suite moved to Playwright's stories model

### Fixed

- the coverage run shared its dependency cache with the dev server
- two config files sat outside every type-checked program
- a unit-only run started a dev server it never opened
- `@types/node` was reaching TypeScript by accident

## 2026-09-05

### Added

- `dialogManager.gate`, one policy in front of every door

## 2026-09-04

### Changed

- a harness that flips a boolean now says so with a checkbox
- the harness dialogs are sized and bounded for the human trying them
- a harness's layout no longer depends on whether its author wrapped the controls

### Removed

- `/warzone`

### Fixed

- a contained panel escaped its card and scrolled the page to the top
- three cards described a harness the page does not render, and three claims were false
- the platform's own close button left the library holding an open dialog

### Notes

- **documented** — two boundaries the matrix was not carrying

## 2026-09-03

### Changed

- every example trigger in the playground is the one button
- four kinds of copy-and-paste collapsed into one declaration each
- the manager's registration no longer latches what it can derive
- coverage rose, because the shared code sits where the gates can see it

### Fixed

- a dialog's icon buttons had no hover, an inline style being unable to carry one

## 2026-09-01

### Fixed

- a new binding export reached a build, because the gate over `CATEGORIES` was scoped to the root

## 2026-09-01

### Changed

- the `focusVisible` row named the wrong outlier

## 2026-09-01

### Fixed

- the correction below was itself wrong, and the test that carried it was the reason

## 2026-08-31

### Added

- an action handler is told when its dialog goes, and a correction to the entry below

### Fixed

- the entry below generalised a measurement from one engine

## 2026-08-31

### Added

- the browser floor, derived from a table instead of declared

## 2026-08-31

### Added

- the two checks the entry below said were missing

## 2026-08-31

### Fixed

- a third pass over `API.md` and `README.md`, and where the gates stop

## 2026-08-30

### Fixed

- the same pass over `README.md` and `API.md`, and five more corrections

## 2026-08-30

### Fixed

- six claims in the CLAUDE.md files that had stopped being true

## 2026-08-29

### Fixed

- the controller example says what it closed with

## 2026-08-29

### Changed

- `moveFocus` spells its step the way the vocabulary already did

## 2026-08-29

### Changed

- `useLookup`'s fallback is written once

### Fixed

- a slide panel portaled into your own host is placed like a portal

## 2026-08-29

### Changed

- the component coverage number stops lying about which engine ran

### Notes

- **corrected** — scroll-lock's compensation is not covered by an existing test

## 2026-08-29

### Added

- six contracts nothing was asking for

## 2026-08-29

### Changed

- `umbra/vanilla` runs the director, and the recorded divergence closes

## 2026-08-29

### Added

- the dismissal paths are driven by a finger too

## 2026-08-29

### Fixed

- the modal backdrop answers the pointer pair too

## 2026-08-28

### Added

- `handle.moveFocus`, for input that is not a keyboard

### Changed

- the WCAG chapter covers what a dialog engine actually touches

### Fixed

- a dismissal you changed your mind about no longer happens
- the same conclusion whichever way the story began
- a close no longer takes a caret the reader had already moved

## 2026-08-27

### Added

- `restoreFocusTo`, for when the row that opened a panel is not the row it ended up showing
- `comment-budget.test.ts`

### Changed

- a `~` for one engine ignoring the close-restore condition
- the comment rule is a gate, and the comments now pass it

### Fixed

- the contained inspector loses your place no longer

## 2026-08-25

### Changed

- `modal` was never the noun: the whole surface says `dialog`
- the two form examples show the markup, and the MUI template layer is gone
- both watch-list cells re-measured, both unchanged
- the reconcileOpen note had the wrong pair written on it
- the matrix worklist says which of ten things were actually work
- a modal's contract declares what each reason closes with

### Fixed

- an exit animation the caller asked for is no longer skipped
- a late policy install lifts what the order needs, not everything
- a raise puts the caret back on every engine, not on the engine's guess

## 2026-08-23

### Added

- the playground demonstrates the surfaces this branch added
- `portal` can name its host, not only `document.body`
- `register` / `unregister` events, and an `open` that says whether it landed
- the registry types the way _in_, not only the way out

### Changed

- one `noop` for the tests, and none for the library

### Removed

- the review note, now that each of its findings has a home

### Fixed

- six findings from reviewing this branch against `main`
- `onDismissRequest` answers every door, not only the keyboard

## 2026-08-22

### Added

- `SelectionDropdown`, the playground's one select

### Changed

- every word budget now carries a 10% buffer

### Fixed

- the select popup was white in dark mode, with white labels on it
- a leftover worktree took the whole suite down
- a close nobody asked for, handed to a caller that asked to open
- the type-only registry counted against unit coverage

## 2026-08-21

### Added

- `ModalRegistry`, so a project can name its modals once
- the playground declares its own modals
- `dialogManager.openAndWait(id)`, the imperative instruct-and-await

### Changed

- the registry is per modal, not all-or-nothing, because the playground said so
- the rest of the close surface reads its types off the id

### Fixed

- the API reference could not show an interface

## 2026-08-21

### Changed

- the card descriptions were essays
- `/advanced` becomes four routes that name what they hold

### Removed

- two examples that taught what another route already taught

### Fixed

- one example was in French, and card prose ran to 98 characters
- nine code samples that had stopped being reachable

### Notes

- Measured before changing anything, and the two obvious targets are both deliberate.

## 2026-08-21

### Fixed

- a running Confirm that read as a dead black box

## 2026-08-21

### Added

- `phase` on the render args, reversing a refusal

### Changed

- Material UI cut to the one pair that carries the claim

### Fixed

- three modals that reverted while they were still on screen
- a lint gate that went red on a dependency bump

## 2026-08-20

### Fixed

- the playground on a phone, and a source viewer that showed everything but source
- the same defect, swept for rather than waited for
- a mascot that teleported when you scrolled a phone
- a dialog that opened focused on its reading area

## 2026-08-19

### Added

- `/design-system`, generated from the sheet rather than describing it
- the theme survives a reload, and does not flash on the way back

### Changed

- three dead tokens out, one literal in, and the measure honoured
- the shell stops branching on the colour scheme
- Geist for text and code, self-hosted, and the page stops jumping on load

### Fixed

- five spinners, none of which span, and now one that does
- a card clipped the focus ring of anything flush against it
- the design-system page was unusable on a phone
- two glitches, one of them from the de-branching above
- an ARIA pass over the playground, and the three things it found
- a mark beside a word aligned to the box instead of the letters
- a panel wider than the `<dialog>` holding it

### Notes

- **tooling** — typedoc off the playground build's critical path

## 2026-08-18

### Added

- three gates, because the sweep that did this broke a rule on its way through

### Changed

- the playground shell has a brand of its own: Penumbra
- the copyable templates speak the host app's typeface

### Removed

- the last vendor code in the repo, and a defect on the page it undercut

### Fixed

- a theme flip was interpolating the outgoing scheme's ink, again

## 2026-08-17

### Added

- `yarn smoke` opens a code panel on `/stories`
- the last twenty, and the exemption list is empty
- the eighteen `bindDialog` harnesses, cut out of the file they share
- the last decision-free lot: `core`, `manager` and `actions`, thirteen cards
- the React harnesses reach the page, fourteen of them
- ten of the seventy-five harnesses reach the page, chosen for what they discriminate
- the stories page has a gate, and it found 75 harnesses nobody could reach
- server rendering, demonstrated by a page that has no server
- `yarn bench`, so the performance claims stop being a reading of the source
- the SSR contract is asserted, and six of the seven guards were already covered
- WCAG 2.2 as the compatibility matrix's fourth axis
- `yarn coverage:update`, the re-measure-both rule made mechanical
- SECURITY.md and CONTRIBUTING.md, and one chip on the landing page

### Changed

- a test that needs the browser's focus says so, and runs where it can have it
- a refusal owes a `why`, and the field is called that now
- `focus-policy.ts` held two kinds, and the coverage number was reading the seam
- the viewer downloads the samples for the route you are on, and no others
- the playground shipped its code viewer to everyone who never opened it
- the coverage tour found one branch no project could reach, and made it pure

### Fixed

- `yarn bench` proved an O(1) claim against two identical objects
- the React Compiler was compiling the Solid binding, and `/stories` is where that shows
- a harness claims the log level for one open, not for as long as it is mounted
- a control that disables itself no longer strands the modal's keyboard
- the focus coordinator's bookkeeping outlives the element it watches
- the story that would have been invisible
- `umbra/react` survives a server render, which it could not do at all
- the focus restore finds the button again instead of remembering it, which is what Solid needed
- the component suite's flakiness was a per-test ceiling, not an assertion
- the Tab stop on the command palette's "separator" was a nameless scroller, on one engine of three
- `public/` has no importable address, and both spellings of that were wrong
- reduced motion is honoured where the playground's dialogs animate

### Notes

- **documented** — the `reconcileOpen` caveat is explained, and one vanilla test says less than it claimed
- **measured** — forced colors, and the templates passed on the first probe
- **noted** — `SlideDirection`'s physical edges are an open question

## 2026-08-16

### Added

- the README's accessibility chapter
- `onError`, for the two userland failures that could not reach you

### Changed

- an alertdialog that is not modal is unwritable, and reported when written anyway
- a matrix cell cites its proofs in the plural, and the a11y cells cite theirs
- the comment convention, applied; and this file, compacted
- both coverage numbers, re-measured in one sitting
- the history of 2026-08-15 and 16 is two commits shorter
- two parameters everywhere, and the rule that says so is on

### Removed

- `HANDOFF.md`, on the terms it set for itself

### Fixed

- the focus scan did not know every kind of Tab stop
- a close could strand the keyboard on `<body>`, and on Chromium the action path did
- the toast claimed an announcement it could not deliver
- `yarn test` ran three engines in one worker pool, and was unreliable for it
- a modal opened by mouse put the keyboard somewhere you could not see
- `onError`'s payload type was unreachable, and its headline case untested

### Notes

- a full audit of the core, and what it found

## 2026-08-15

### Added

- how a callback refuses is what its name has to say
- eight of the fourteen shapes `HotkeyDef` names had never reached `parseHotkey`
- `runDeclarationWindow` is the shape of every render pass, and nothing ran it
- the reclaim floor, measured on Solid and on vanilla instead of inferred from the core

### Changed

- a lock owner is a minted token now, not "any object"
- "about 200 lines each" now says which 200 lines, because it was read two ways
- Web Storage failure is a decision now, with all three of its failures reachable
- the scroll lock's ownership is a decision now, so the rule it protects can fail a test
- `preferredRestoreTarget` asks for what it reads, and is a unit test now
- the lifecycle executor is its own decision, so its two invariants can fail a test

### Removed

- the lazy `LogData` thunk, which nothing has ever passed
- `isNullish`, which existed twice and was called nowhere

### Fixed

- `prepare` was called a gate in three places, and it cannot refuse anything
- `onKeyDown`'s `preventDefault()` takes the whole press, and the doc named one quarter of it
- `containFocus` told you to set it on a modal dialog, where it now buys nothing
- two public options were missing from the table a caller reads
- `parseHotkey` was undocumented in the chapter that names its four siblings
- the coverage pair is quoted in two documents, and only one was being moved
- `applyStyle`'s custom-property branch was called unreachable, and is not
- the storage probe re-ran forever in the one environment it was written for
- `createLogger`'s documentation was on the private helper above it
- the Tab recovery could hand focus to a control belonging to a nested dialog

## 2026-08-14

### Added

- `bindDialog` adopts a dialog the server sent already open
- shadow-root tests for React and Solid, which had been claiming it on vanilla's

### Changed

- the playground's layer rule is a gate now, because prose was not holding it
- the CI matrix shards the unit suite and stops sharding the component one

### Fixed

- a raised dialog that claimed no opening focus gets a real floor under it
- that floor asked the document who had focus, and a shadow root answers with the host
- `yarn check` did not deny lint warnings, so three had accumulated invisibly

## 2026-08-13

### Changed

- the order the lifecycle is wired in is a decision the core makes now
- the dialog that needs the focus is the one that asks for it

### Fixed

- `chooseActionRunner`, and two conventions that were held by memory
- the focus restore was relying on Chromium's inertness, and WebKit said so
- `docs:matrix` renders through prettier, so a no-op run is a no-op
- `/api` answered 500, and every gate was green
- five component tests contributed nothing to the coverage report
- the playground smoke test could pass over nothing

### Notes

- the dismiss key handed to the owner
- **ci** — one component job per engine
- **docs** — `yarn todo`, and the open question a `✓` was hiding
- **tests** — the worklist worked through, a real Solid defect, and the compiler finally asserted
- **tests** — the dismiss key nobody answers was not a bug, and five options Solid had never exercised
- **tooling** — typedoc's rendering half deleted, and the TS 7 replacement scouted rather than shipped
- **docs** — the agent files put on a budget, and the routing rule that makes it payable
- **docs** — a compatibility matrix, and the twenty open cells it publishes
- **tooling** — one linter, on the same compiler as `tsc`, and three rules that were never running
- **tooling** — the editor was still wired to the linter that was removed
- **docs** — seven defects an inventory found before it wrote a single row
- **tests** — the four gaps that were named rather than closed, and a prediction that was wrong again
- **docs** — the modality rule is enforced, and the prose still said it could not be

## 2026-08-12

### Added

- `dialogManager.prioritize`, because "last one wins" is a race
- `isOwnEventTarget` is public, beside `isKeyClaimedByPopup`
- `isKeyClaimedByPopup`, the question the dismiss listeners ask, now askable
- `dialogPlacement` answers for the scrim a non-modal dialog draws itself
- `parseHotkey`, the way back into `HotkeyDef`
- `modal:open` carries the `<dialog>` element
- `reconcileOpen`, for wrapping this library in a component driven by an `open` prop
- `containFocus`, the Tab wrap a non-modal dialog does not get from the browser

### Changed

- `containFocus` is two focus markers now, not a computed boundary

### Fixed

- a dialog opening underneath another does not take its focus
- the stack order puts every non-modal dialog under every modal one
- `containFocus` answers the one Tab its markers cannot see
- `containFocus` let the keyboard out of any dialog holding a toolbar
- a dialog took the dismiss key from the popup the user was actually looking at

## 2026-08-11

### Added

- `formatAriaKeyshortcuts`, because a hotkey has two audiences
- `aria-busy` on the dialog while `prepare` runs
- the library says when a labelling reference points at nothing

### Changed

- the component test report is uploaded only when something failed
- one component owns where a modal's actions sit
- the vanilla slide panel says what its MUI twin says
- the README's moons are drawn from the favicon
- `runDeclarationWindow`

### Removed

- GitHub code coverage, attempted and reverted the same day

### Fixed

- the exit animation's safety timeout was racing the animation it protects
- the vanilla form modal's bottom border, and a green ring on a field in error
- the microfrontend frame was unusable on a phone, and 200px too tall everywhere
- the microfrontend frame ignored the theme toggle
- a hairline beside the sticky jump bar
- `aria-keyshortcuts` was not a conforming ARIA value
- the React Compiler had not been running for a while
- `useLookup` answered from the first render for ever
- **playground** — 24 dialogs announced as just "dialog"
- a vanilla button unbound mid-action stayed disabled forever

### Notes

- `role: 'alertdialog'` does not require `ariaDescribedBy`

## 2026-08-10

### Added

- tests for six paths the suites had never taken
- the four Solid paths nothing was asserting
- unit coverage, and the three signatures that were blocking it
- `action.isRunning(reason)`, the per-action state away from its button
- a note on the tooling, in the README

### Changed

- the moon glyphs are an SVG, and the decorative ones are marked as such
- the microfrontend frame is two by two, and its four panels finally agree
- the microfrontend logs are fixed boxes, newest first
- the dismiss reservation now holds where the type cannot
- breaking: `DialogSnapshot` is `ModalSnapshot`
- two more signatures narrowed, and a file put where it belongs
- the docs the coverage work left behind
- breaking: `'dismiss'` is reserved, and it is a type now
- the README lists the surface that exists

### Removed

- the ⏎ glyph on every button that declares a hotkey

### Fixed

- WCAG 2.2 AA: 28 contrast failures, and no keyboard focus indicator anywhere
- the new focus ring was being cut in half, and the audit now says so
- mobile: a 13×13 checkbox, and the reflow that was fine all along
- four modals were cut off on the right, and only on a phone
- the cosmic gate lost its top and bottom rim
- the MUI form modal's bottom border was missing a pixel
- the cosmic backdrop's corona was sliced, then marooned
- the corner toast logged a React error every time it expired
- the debug logger was unreadable on a light devtools console
- the component coverage measured nothing at all on Windows
- the report merged the previous run's counters into this one
- four claims in the docs and comments that had stopped being true
- the component coverage was pointing at the wrong lines
- the CT build cache made the coverage switch a coin toss

## 2026-08-09

### Added

- the microfrontends get a route of their own
- `umbra/solid` and `umbra/vanilla` chapters in `API.md`
- `umbra/solid` and `umbra/vanilla` in the generated `/api` reference
- `umbra/vanilla`, a third binding of a different kind
- `umbra/solid`, a second binding, and the answer to what a binding actually is
- `engine.undeclare`, and the bug it exists for
- unit tests for the framework-free logic that only React had ever exercised

### Changed

- a core terminology pass, and the vocabulary written down
- what moved out of the renderers and into the core
- the microfrontend demo is three microfrontends, across three frameworks
- `root-react-free.test.ts` is now `entry-isolation.test.ts`
- the React binding lives in `src/react/`, and the folder names stop lying
- a `templates/` folder in each binding, and no `hooks/` folder in either
- the duplication between the two bindings, measured and removed
- the coverage exclude list says what the unit project can reach

### Fixed

- a failed action handed focus to the dialog instead of the button that ran it
- the `type` badge was drawn in the page's own background colour
- a `<dialog>`'s last fractional pixel, and the border that lived in it
- the root's published types no longer require `@types/react`
- `umbra/solid` looked like it was missing a slide modal, and the folders were why
- the logger stopped warning where there is no `localStorage`

### Notes

- the generated API reference covers `umbra` and `umbra/react` only

## 2026-08-08

### Added

- `openAndWait()`, because the call order was load-bearing and undocumented
- `requestOpenAndWait`: the ask, and the answer
- a microfrontend demo that is not staged
- `chrome-cdp`, a skill that answers "which rule won"

### Changed

- breaking: one act, one word
- the payload crosses in both directions, and neither side trusts it

### Removed

- breaking: `waitForClose()`
- breaking: `loading` on an action's props

## 2026-08-07

### Added

- `requestOpen`: an open a dialog is allowed to refuse

### Changed

- breaking: the state vocabulary says what it means
- the DOM events say why they exist
- the playground as a shop window
- hooks give their DOM policy back to the core

### Fixed

- the playground was measured, and it disagreed with itself

## 2026-08-06

### Added

- - **`onOpen` is handed an `AbortSignal`** that fires when the modal closes, so work it started can be dropped when nobody is waiting for it any more.
- - **The `dom-probe` skill** (`.claude/skills/dom-probe/`) — one script that drives installed Chrome through ordered steps and answers ordered questions about what the browser actually produced: what is under a point, what a click really ...
- `focusOnOpen` on an action

### Changed

- - **The close sequence moved out of the React effect** into `runCloseSequence` in `core/dialog-lifecycle.ts`.
- **playground** — - **The theme is the mascot's.** `UmbraMoon` draws an eclipse — a dark slate body with the corona escaping around its rim in ambers — and the page around it was fuchsia, which read as two brands sharing a screen.

### Fixed

- - **Unregistering an open dialog now reports the close.** A modal whose component unmounts under it never calls `close()`, so the phase never reaches `'closed'` — and the subscription that emits on that transition is torn down in the sam...
- a modal answered for the modals above it

### Notes

- **a full pass over what a reader is told** — - **`API.md` documented an API that no longer exists.** Three of its examples still passed `actions: state` into a hook and spread `state.confirm(…)` — the `useModalActions` design that went away when actions became declared by use.

## 2026-08-05

### Added

- - **`ModalInfo.isPreparing`** — `lookup(id)` and `useLookup(id)` now report whether a dialog's `onOpen` is still running, alongside `phase` and `isOpen`.

### Changed

- **playground** — - **Cosmic Override wears the mascot's colours.** The neon purple-and-cyan wormhole is an eclipse: a dark slate body with the corona escaping around its rim, in `PeekingMoon`'s ambers, down to the `::backdrop` — which is now a corona rin...

### Fixed

- - **A hotkey went dead once its action failed.** An action's button is `disabled` for as long as the action runs, so focus falls to `<body>` in the meantime.

## 2026-08-04

### Added

- **a mascot** — - **`PeekingMoon`** — the playground's easter egg, a sibling to stardust's `PeekingStar` and built on the same timing model.

### Changed

- **the store's React half moved out of its framework-free half** — - **`useStore` and `createStoreContext` now live in `src/store/react/`**, behind their own barrel.
- breaking (actions are declared by being rendered)
- **the project has a name** — - **`@yourorg/dialog` is now `umbra`** — the total-shadow core of an eclipse, which is exactly what a modal backdrop casts over the page, and what `--dialog-backdrop` has always been.
- **project commands** — - `store-engineer` documented `useStore(store, { context })`, which does not exist — `useStore` takes `{ select, equals }`, and injecting context from a component is deliberately impossible.

### Removed

- **surface the library never used** — - **The async toolkit is no longer part of the package.** `safeAwait`, `createMutex`, `createSingleFlight` and the `AsyncState` machine (`asyncIdle` / `asyncPending` / `asyncFulfilled` / `asyncRejected` / `runAsync`) — 9 values and 6 typ...

### Fixed

- - **A branch that could never run.** The workspace example compared `closeResult.reason === 'close-rx'` against an action named `closeRx`.
- **CI could not have caught what it was meant to** — - **The Playwright container tag is derived from `package.json`** instead of being written by hand.
- **the static-host build had a broken jump bar** — - **Section links navigated to the index page instead of scrolling.** `SectionNav` emitted a bare `href="#stacking"`, which works under browser history but not under the hash-router build (`yarn playground:build:file`) — the one `deploy-...
- **a smoke probe that was checking nothing** — - **`playground-smoke` reported eight green routes after visiting one page eight times.** Pointed at a hash-router build, its path-based `goto` was served `index.html`, the router fell back to the index, and every per-route assertion — i...
- **the inference was real but undiscoverable** — - **`defineAction`'s doc pointed the wrong way.** It said declaring a payload was how you "require a modal that accepts it" — which reads as _annotate both_, and is the likeliest reason six call sites restated a payload the hook already ...

## 2026-08-03

### Added

- **the inference is pinned, so it can be relied on** — - **`useModal<Result>({ actions })` never needed the type argument**, and now there is a test saying so.
- **a dialog can finally say what it is** — - **`ariaLabel`, `ariaLabelledBy`, `ariaDescribedBy` and `role`** on `useModal` and every template.
- **the styling surface** — - **`--dialog-backdrop`.** The library's one visual opinion is now a custom property, read by its single `dialog::backdrop` rule and still defaulting to `rgba(0, 0, 0, 0.7)`.
- **playground** — - **A "Cosmic Override" showcase on `/advanced`**, which exists to mark where the library stops: it takes every hook offered — a restyled `::backdrop`, custom entrance and exit transforms, a contained non-modal dialog answering to a sect...
- **the examples are code, so they are held to the code gates** — - **`yarn docs:examples`** extracts every `@example` in `src/` into a real module and runs prettier, `tsc` and eslint over it — the three gates a doc comment sits outside of.
- - **`dialogPlacement()`** — the positioning contract for a dialog, as data, from the framework-agnostic root: `{ nonModal, portal, clip }` → `{ host, dialog }`.

### Changed

- **the type model derives where it used to enumerate** — - **`TemplateCommonOptions` is now the complement of what a template owns, not a list of what it forwards.** It was a hand-maintained `Pick` of twelve key names, which meant an option added to `UseModalBaseOptions` reached the core hook ...
- **playground** — - **Five examples stopped restating the payload they had already declared.** The form examples (vanilla, MUI, zod), the MUI wizard panel and the cosmic override each wrote their payload type twice — once on `defineAction`, once as an exp...
- - **`useMessageModal` now reports `modalType: 'message'`** instead of inheriting `'modal'`.

### Fixed

- **documentation describing a hazard that does not exist** — - **The warned-about `createStore` "arity trap" was not real.** Two CLAUDE.md files and a five-line comment in the action engine held that `createStore<Snap, Methods>(initial, builder)` matches the generic `<TSnapshot, TContext>` overloa...
- **playground** — - **A typedoc failure during a build said only `Command failed`.** The API model is generated on every playground build — including the deploy one — and typedoc runs there with `treatWarningsAsErrors`, so a broken `{@link}` fails the build.
- - **A closed dialog was still laid out, and ate clicks.** The UA hides one (`dialog:not([open]) { display: none }`), but the library's inline `display: flex` outranked it — and a contained non-modal dialog is `inset: 0`, so every closed ...
- - **A contained non-modal dialog made its whole region unclickable.** The host the library renders around it is `absolute; inset: 0` over that region for the modal's whole life, closed included, so it silently ate every click behind it —...

## 2026-08-02

### Added

- **playground helpers** — - **A fuzzy matcher** (`shared/lib/fuzzy-match.ts`) behind the symbol search: subsequence scoring that rewards word boundaries and runs, then a Damerau–Levenshtein pass with a free start so `modla` and `modul` still find `useModal`.

### Changed

- **the API reference is a document, not a list** — - **`/api` is now a map plus ten chapter pages.** One page listing ninety symbols is a scroll, not a reference: `/api` opens on start-here links and a card per category, and each category — Dialog manager, Lifecycle events, Store engine,...

### Fixed

- **reading the generated prose** — - **The source's hard wrap became the page's ragged wrap.** Doc comments are wrapped at 100 columns for the editor; those newlines were rendered verbatim.
- **documentation audited against the code** — - **Every `@example` in the public API now compiles.** All 33 were written into real `.tsx` modules and run through the project's own `tsc` — free identifiers (`store`, `fetchUser`) stubbed, snippet-only shapes normalised — and the resul...

## 2026-07-31

### Added

- **the API reference is a playground page** — - **`/api` renders the generated reference with the playground's own components.** A Vite plugin ([`playground/vite-plugins/api-model.ts`](playground/vite-plugins/api-model.ts)) runs typedoc over both entry points, projects its ~470 kB g...
- **worked examples on the public API** — - **Eleven exported functions gained an `@example`** — 14 of 31 had none, and they were the ones a signature does not explain: `safeAwait`, `runAsync`, `createMutex`, `createSingleFlight`, `watch`, `shallowEqual`, `normalizeError`, `matc...
- - **An action's callable takes `ActionOptions` as well as a handler**, so a caller can add to the spread without taking it apart: `actions.confirm({ onAction, disabled: !formValid })`.

### Changed

- - **The playground pins the React Compiler target** (`reactCompilerPreset({ target: '19' })`) instead of relying on the plugin's default.
- **two names that carried an opinion they should not** — - **`ModalType` is gone; `modalType` is a `string`.** It was `'modal' | 'slide'` — a framework-agnostic, template-agnostic core enumerating `useSlideModal`, a hook that lives above it, right down to the payload of the public DOM events.
- **playground** — - **The "Async Open" example is now a `useQuery` marriage** rather than a bare `setTimeout`.

### Removed

- - **`ts-reset`.** Verified rather than assumed: with the overload ambiguity above fixed, removing it produces zero errors anywhere.

### Fixed

- **generated docs** — the generator had been told to stay quiet)
- - **Two `createStore` call sites were selecting the wrong overload by arity.** `createStore` has `<TSnapshot, TContext>` and `<TSnapshot, TMethods, TContext>`, so `createStore<Snapshot, Methods>(initial, builder)` matches the _generic_ o...
- **playground** — - **A warm open flashed the loading panel.** With the cache already filled, the Async Open example showed its fallback for a moment before the content.
- **Escape depended on where focus was** — - **The browser closed a modal behind the store's back whenever focus sat outside the dialog.** ESC handling lived on a `keydown` listener attached to the `<dialog>`, which only fires while focus is inside it — and focus outside an open ...
- **the props an action spreads onto a button** — - **No `type`, so an action button submitted the form around it.** A `<button>` inside a `<form>` defaults to `type="submit"`, and the MUI form-modal template renders a real `<form>` — so spreading an action there submitted the form _and...
- **playground templates** — - **The MUI button never rendered a spinner.** It folded `loading` into `disabled` and then dropped it, so a running action looked merely greyed out.

## 2026-07-30

### Added

- - **Compile-time assertions for the payload path** in [type-model.test.ts](src/core/__tests__/type-model.test.ts): that a render callback's `handle.close` takes exactly the modal's payload, that a template's handle is the same type rathe...

### Changed

- **`isOpening` → `isPreparing`** — - The field tracks whether the user's `onOpen` callback is still running, which is a different axis from the `'opening'` **phase** — `phase` reaches `'open'` on the animation frame after the dialog is shown, usually well before an async ...
- **the action vocabulary says what it does** — - **`createActionController` → `defineAction`, `useModalController` → `useModalActions`.** With the reason argument gone the factory no longer creates anything — its whole job is to declare that a config key is an action — and the thing ...
- **nothing writes to a store during render** — - **`useStore` is read-only.** Its `{ context }` option injected the store's dependencies by calling `setContext()` _during render_ — a mutation of shared state in a phase React may run twice, discard, or interleave, and last-render-wins...
- **the close payload is typed end to end** — - **`TData` now reaches every door a modal closes through.** It was declared on `useModal<TData>` and honoured only by `onClose` / `waitForClose`; `handle.close(reason, data)` took `unknown`, and so did an action's `close(data)`.
- **the manager's own model** — - **`ModalInfo` is discriminated on `exists`.** `modalType` and `nonModal` are registration-time facts, so they were optional on a flat object and every reader wrote `info.modalType ?? ''` — a fallback for a case that only arises when th...

### Fixed

- **packaging** — the published types were silently `any` for NodeNext consumers)
- **a non-modal panel no longer eats keys it does not use** — - **The window-level dismiss-key listener claimed the key before deciding whether to act on it.** A non-modal panel installs a capture-phase listener so its dismiss key works wherever focus is, and it `preventDefault()`s and `stopPropaga...
- **hotkeys** — a whole family of them could never fire)
- **three defects found by reading the core with fresh eyes; each proven by a failing test first** — - **A second dialog manager released a body scroll lock it never took.** The lock is global — one `document.body` — and was mirrored by a module-level boolean, so it was last-writer-wins.
- - **`createActionController('confirm')`'s argument was never read** — the close reason has always been the _config key_.

## 2026-07-29

### Added

- - **`yarn verify:package`** ([scripts/verify-package.mjs](scripts/verify-package.mjs), wired into `prepublishOnly`) — resolves the built `dist/` from a synthetic external consumer under `moduleResolution: NodeNext`, for both entry points...
- **tests** — the state machine had none)

### Changed

- **core** — functional/React separation)
- **repo** — playground is its own workspace)
- **types** — the model derives instead of restating)
- **package** — the core is framework-agnostic, React is a binding)
- **playground** — information architecture)

### Removed

- - **The `KeyExtensions` augmentation point** — an empty interface plus two blocks of JSDoc teaching users module augmentation, so that `KeyValue` could be widened with keys the built-in `Key` constant does not carry.

### Fixed

- - **Backdrop clicks are identified by their target, not by coordinates alone** — the handler only tested whether the pointer fell outside the dialog's rect, and relied on a `stopPropagation` wrapper around the content to stop everything ...
- **packaging** — `./react` was missing the entire core for NodeNext consumers)
- **core** — long-lived-app defects, each caught by a test written to fail first)
- **documentation** — - **`README.md` and `API.md` taught the wrong import paths** — the entry-point split left 13 documented imports pointing at the root for symbols that now live on `./react`, including the README's Quick Start, which is the first snippet a...
- **playground** — - **The section jump bars actually stick** — `RootLayout`'s content box declared `overflow: auto`, which never scrolled (the window does) but made that box the nearest scrolling ancestor, silently disabling `position: sticky` for everyth...

### Notes

- **documentation** — - **`isOpening` vs the `'opening'` phase** — the two are orthogonal and the one-line doc comment did not say so.

## 2026-07-28

### Added

- - **`useSlideModal` cross-axis alignment — `align?: 'stretch' | 'start' | 'center' | 'end'`** — the cross axis is the one perpendicular to the slide (vertical for `left`/`right`, horizontal for `top`/`bottom`).

### Changed

- **tooling** — Yarn 4, and declarations via `tsc`)
- **internal** — pure async helpers leave the store module)

### Fixed

- **scroll lock no longer shifts the page** — - **The body scroll lock now compensates the reclaimed scrollbar width** — locking was a bare `overflow: hidden`, so on any scrollable page opening a modal removed the classic scrollbar, widened the viewport, and shifted every centered o...
- **playground** — vanilla templates)
- **playground UX** — Slide Modal Configurator)
- **tooling** — - **`console` no longer flagged in `.claude/` debug scripts** — `no-console` was warning on the `dialog-debug` probe, whose entire output is console-based.

## 2026-07-27

### Changed

- **internal** — DOM lifecycle decoupled from React)

### Removed

- **breaking** — CSS-var theming leaves the core)

### Fixed

- **playground** — - **Slide Modal Configurator SIZE pane now drives the panel across the full range** — the `SlideModal.DefaultLayout` template pins horizontal drawers to `minWidth: 320` / `maxWidth: 640`, so configured widths below 320 were silently clam...

## 2026-07-25

### Fixed

- **behavior change** — non-modal + no-portal is now "contained")

## 2026-07-24

### Changed

- **breaking** — action-controller surface tightened)

## 2026-07-23

### Added

- - **Complete action lifecycle logging** — `useModalController`'s action engine now logs the whole lifecycle at the single `runAction` chokepoint: `Action started`, `Action close`, and `Action completed` / `Action failed`, each carrying t...

### Changed

- **breaking** — store loses `update`, `{ name }`, and DevTools)

### Removed

- - **UMD build dropped — ESM only** — the package no longer ships a UMD bundle.

## 2026-07-18

### Added

- - **Dialog manager unit tests** — `src/manager/__tests__/dialog-manager.test.ts` drives fake stores through the full phase machine headlessly: snapshot freshness across every phase (including `'closing'`), open/close event emission with ...

### Changed

- **breaking** — query surface trimmed)
- **internal simplification** — no public API change)

### Removed

- - **`log.group`** — dead logger API, never called.

### Fixed

- - **`open()` always settles** — calling `open()` while the modal was already open (or opening) returned a promise that never resolved, and a second call during the opening sequence silently discarded the first caller's resolver.

## 2026-07-17

### Added

- - **Public-repo hygiene** — `LICENSE` (MIT), `.github/workflows/ci.yml` (install / lint+format / type-check / unit / component-in-Playwright-image / build as parallel jobs), `typedoc.json` + `docs:api` script (HTML API docs generated to ...
- - **Unit tests for the store utilities** — `createStore` (generic + domain, `set`/`update`/`reset`/context/equality), `watch`, `createMutex`, `createSingleFlight`, `safeAwait`, and the async-state helpers now have `src/store/**tests**/*....

### Changed

- **tooling** — - **Lint overhaul, aligned with stardust** — adopted **oxlint** (`.oxlintrc.json`) as a fast first pass with `eslint-plugin-oxlint` disabling the ESLint rules it covers; `lint` is now `oxlint && eslint .` plus `lint:oxlint` / `lint:eslin...
- - **State layer migrated off Stardust → zustand + immer** — the `@stardust/core` / `@stardust/react` dependency is replaced by an internal [`src/store/`](src/store/CLAUDE.md) module.
- **tooling** — - **Lint overhaul, aligned with stardust** — adopted [oxlint](https://oxc.rs) (`.oxlintrc.json`) as a fast first pass, with `eslint-plugin-oxlint` disabling the ESLint rules it already covers; `lint` is now `oxlint && eslint .` (plus `li...
- **playground** — - **`workspace-review` and `vanilla-zod-form` rewritten onto immer `update()`** — replacing `createArrayMethods`, `setByPath`, `batch`, and `createStoreDispatch`.

### Removed

- **cleanup** — - Unused devDependencies (`solid-js`, `fast-check`, `react-markdown`, `remark-gfm`, `@types/eslint`, `@types/estree`); added the actually-used `@mui/system`.
- - **`createStoreSubscription`, `createDerivedStore`, `connectDebugLog`, `ReservedStoreKey`, `listenerCount`** — the subscription primitive is unnecessary now that the cell is a zustand store (the dialog manager uses a generic `createStor...

### Fixed

- - **Playground type errors** — MUI v9 `Typography` prop migrations (`fontWeight`/`display`/`gutterBottom` → `sx`), typed `Select<DismissMode>`, and typed store initial states (`reactive-deps`, `dismiss-key`, `vanilla-form`, `Section`).

### Notes

- **documentation** — - **All docs synced to the new store** — `API.md` store sections rewritten (two-mode `createStore`, `createSingleFlight` modes, `createMutex`, `watch`, `createStoreContext`; removed `useSuspenseStore` / `produce` / `createStoreDispatch` ...

## 2026-04-23 — 2026-02-18 · compacted
