# Changelog

Kept per [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), by date. No semver: names change
between commits when a better one shows up, and the entry says which and why.

## 2026-09-15, the package is called `umbra`

### Changed

`antumbra` → `umbra`, and the dialog manager that was `umbra` is now `antumbra`. The two traded
names.

`umbra` is the root the other two names derive from — _pen_·umbra, _ant_·umbra — so it should name
the package the others build on. That is this one: everything boots, and the libraries that come
later will declare steps here rather than the other way round. The astronomy agrees. The umbra is
the deep cone, the stretch of shadow where the source is gone entirely — which is the dark a
bootstrapper works in, before anything has been lit and before there is a frame to show anyone.

`ante umbra`, "in front of the shadow", goes to the library that renders into the top layer.

Nothing in the public surface survived unrenamed: `antumbra/plain` is `umbra/plain`, and every
import specifier, micro-frontend entry file and declaration-merging augmentation followed. The
mascot kept its watching face — that belongs to what this library does, not to what it is called —
but its favicon swapped, since that drawing is the shadow region itself and a thin ring with no bite
is an antumbra, which this no longer is.

The deployed URL did not move. `/playground/boot` is named for the capability, which is why.

## 2026-09-15, the tokens the two projects share now have an owner

### Changed

`playground/src/app/styles/tokens.system.css` is gone. `app.css` imports
`penumbra/tokens.system.css` instead.

This copy was the better-worded of the two — its header carried four extra lines explaining what the
split is for and predicting that the copies would collapse once these projects shared a repository.
That header is why the two files differed at all: across 93 lines, no declaration differed. The
prose was right and it is now unnecessary, so the package keeps the rule and drops the prediction.

`tokens.skin.css` stays. The ring-and-gold palette is this project's and is meant to look nothing
like the sibling's corona; sharing it would defeat the split it belongs to.

### Added, indirectly

A guard this project never had. The rule "no colour and no typeface in the system half" was enforced
by a test inside the _other_ playground, so this one imported the same sheet with nothing checking
it. `penumbra`'s `yarn check` now covers both, and runs from the root `yarn check`.

## 2026-09-15, a scope that does not name a browser

### Changed

`StepScope` said `'page'` and `'app'`. Neither survives leaving a document: the core has no
framework and no DOM, and it runs in a worker and in Node, where "page" names nothing and "app" is
whatever the reader already thought it meant. The sharing boundary is one `globalThis` — a browsing
context, a worker, a process — so the names now describe the _sharing_ and leave the boundary to the
file that implements it.

| Was                      | Is                         | Why                                                                                   |
| ------------------------ | -------------------------- | ------------------------------------------------------------------------------------- |
| `scope: 'page'`          | `scope: 'shared'`          | says what it does rather than where it happens to run; `SharedResult` already said it |
| `scope: 'app'`           | `scope: 'instance'`        | the work belongs to this bootstrap instance, and a second one does it again           |
| `clearPageScope`         | `clearSharedScope`         | follows                                                                               |
| `claimPageStep`          | `claimSharedStep`          | follows, internal                                                                     |
| `core/page-scope.ts`     | `core/shared-scope.ts`     | follows                                                                               |
| `antumbra.page-scope.v1` | `antumbra.shared-scope.v1` | the registry symbol; a copy on the old key simply does not share with a new one       |

The playground's microfrontend demo carries `?scope=` in links it hands out, so its values moved
with the API rather than translating at the edge — a demo that spelled the old names would be
teaching them.

`'shared'` was preferred over `'realm'`, which is the precise ECMAScript word for what a
`globalThis` bounds: the boundary is the mechanism, and a public API reads better naming the
intent. It is documented on `StepScope` and again in `core/shared-scope.ts`.

### Fixed

- A comment in the scope module read "Not for tagion" — a word left behind when the history was
  rewritten to remove domain vocabulary, and one that had been sitting in the file since.

## 2026-09-14, the words on screen

### Fixed

- The outcome and event readouts had been rendering with class names nothing defined since the
  port — the same loss as the dialog's. They are styled again, on tokens, and no longer carry a
  heading of their own: the card around them already has one, and two titles for one panel is what
  it looked like.
- The labels followed the rename. A column fed by `.status` under a header saying "Outcome", and a
  readout labelled "phase" showing `settled`, are the exact confusion the rename exists to remove —
  on the page whose whole job is teaching the vocabulary.
- `useBootstrap`'s own example still destructured `phase`. It renders verbatim in the reference, so
  the first thing a reader copied was the old name.
- Dead rules left by the port went with it: the site chrome, the frame and the reference page each
  own their styles now.

## 2026-09-14, one noun per concept

### Changed

Everything in the package belongs to one of three things — the **bootstrap** you declared, one
**run** of it, one **step** inside that — and the names now say which. Two words meant two things
each, and one concept wore three prefixes. No consumers, so this is the cheap moment.

| Was                                        | Is                          | Why                                                                                                 |
| ------------------------------------------ | --------------------------- | --------------------------------------------------------------------------------------------------- |
| `StepOutcome`                              | `StepStatus`                | `Outcome` is the object a run produced; `outcome.timeline[0].outcome` was one noun at two ranks     |
| `StepTrace.outcome`, `StepFailure.outcome` | `.status`                   | follows                                                                                             |
| `Intent.origin.stepOutcome`                | `.stepStatus`               | follows                                                                                             |
| `RunPhase`                                 | `RunStage`                  | a `phase` is `preflight` or `mounted`; `snapshot.phase` and `step.phase` were not the same question |
| `RunSnapshot.phase`                        | `.stage`                    | follows                                                                                             |
| `IntentState`                              | `IntentStatus`              | third of three lifecycle enums, and `SessionState` is an object                                     |
| `Intent.state`                             | `.status`                   | follows                                                                                             |
| `useBootData`                              | `useStepData`               | `StepId`, `DataOf` and `readStepData` all say step; this was the outlier                            |
| `IntentCollector`                          | `IntentQueue`               | every line of prose calls it the queue                                                              |
| `BootStatus`                               | `RunStatus`                 | describes a run                                                                                     |
| `BootEvent`                                | `RunEvent`                  | describes a run                                                                                     |
| `BootData`, `PartialBootData`              | `RunData`, `PartialRunData` | describes a run                                                                                     |
| `BootPlan`                                 | `BootstrapPlan`             | static analysis, belongs to the machine                                                             |
| `BootRegistry`                             | `StepRegistry`              | keyed by step id, like `NoticeRegistry` is by notice type                                           |
| `BootError`                                | `BootstrapError`            | the last `Boot`                                                                                     |

`Session` is knowingly left alone, and it is the one collision that remains: `boot.session()` is the
live half of a run, while `session` is what almost every app names its token step. Renaming it is a
larger call than these.

## 2026-09-14, icons, and code that looks like code

### Added

- An icon set, drawn here rather than installed: nine glyphs on one 24×24 grid, every one a stroke
  on `currentColor`. A component library for nine glyphs would have been the largest dependency on
  the page. The theme switch is a sun and a moon, "view code" is a pair of angle brackets, and both
  sit in `AppIconButton` — which requires an `aria-label`, because every glyph in the set is
  `aria-hidden` and the button is the only name a screen reader gets.
- Syntax highlighting, and a copy button on every code surface. Prism through
  `react-syntax-highlighter`, registered grammar by grammar — an unregistered language renders as
  plain text and raises nothing, so the list is short on purpose. Token colours are raised to 4.5:1
  against the surface they are actually painted on: the themes are tuned for their own backgrounds,
  and on this site's the quietest ones fall under the bar.

### Changed

- The eleven `oxlint-disable` comments were re-checked one at a time, by deleting all of them and
  reading what came back. Ten are load-bearing — the empty interfaces _are_ the merging mechanism,
  and `keyof` of one of them is `never` only until somebody augments it. One was a duplicate: two
  disables for two findings on the same line, where one covers the line. The reason now lives in the
  disable comment rather than above it, so deleting the comment deletes the excuse with it.

## 2026-09-14, the reference in chapters

### Changed

- The API reference is eleven pages instead of one. It was seventy-eight symbols in a single column
  — twenty screens of scroll with four chips to navigate it — and it is now a map at `/api` and a
  chapter per entry, with a sticky rail that unfolds the open chapter to its symbols, fuzzy search
  over every name, and a next/previous pair at the foot of each chapter.
- The model behind it carries structure rather than strings: a signature is a list of parts whose
  referenced types link to their own entries, and parameters, type parameters, properties and
  returns are tables rather than prose. Errors are in it too — the four classes a `catch` block is
  written against were dropped entirely by the old projection.
- Routes are one `const` each again, the way they are next door. The helper that built them widened
  every path to `string` in the route tree, and the route tree is what types `Link`, `useParams` and
  `useSearch` — so `/api/$category` read its parameter as `any` and a wrong `to=` landed on the
  caller rather than on the helper.

### Fixed

- Both home-made modals scrolled twice: the sheet and the content inside it. The sheet is
  `overflow: hidden` now, with its head and foot pinned and only the middle scrolling.
- A `{@link}` in `PreflightContext` pointed at a member of an inline type, which typedoc resolves to
  the wrong target and reports as a warning — a warning the reference's own build treats as an
  error.

## 2026-09-14, the playground on a router

### Changed

- The playground is a routed site rather than one page with a nav that never changed the address.
  TanStack Router, one lazy route per page, and Feature-Sliced layers — `app` → `pages` → `widgets`
  → `entities` → `shared` — so what a file may import is read off where it sits. The demo that used
  to be the whole site is now `/getting-started`; `/` is a home page that says what the library is
  for before showing any of it.
- Every example is a card with a `codeKey`, and the layout holds one dialog that shows the source by
  key. Sixty dialogs in the DOM, each carrying the largest text the site ships, was the alternative.
- The component suite mounts its harnesses through the gallery door rather than through the
  `/stories` route. The route renders inside the app — router, providers, layout, code dialog — and a
  harness carrying all of that measures the app as much as the binding.

### Fixed

- **The code dialog's opener was being called instead of stored.** A React state setter handed a
  function treats it as an updater, so `setOpen(open)` ran the opener during the provider's render —
  a state update from inside another component's render, logged on every page of the site in dev.
  The opener is held inside an object now.
- The React story created a second root on a container the first had not released, because the
  teardown is deferred and StrictMode mounts twice. Each mount gets a container of its own, and the
  deferred teardown removes it — the deferral is what keeps React from tearing a root down inside
  the parent effect's cleanup.
- The scope control on the micro-frontend page pointed at `/mfe`, a route the port renamed. It is a
  typed `<Link>` now, and one `readScope` serves both the route's `validateSearch` and the page that
  reads it back. The smoke test clicks it.
- The dev server gave up on dependency pre-bundling entirely: its scanner walks `public/`, found the
  fragment importing `antumbra-copy` — a specifier only the frames' import map knows — and stopped.
  `optimizeDeps.entries` is the app's entry now.
- The two demo frames were one component written twice, and one of them reached sideways into the
  other page for its stylesheet. Both are `shared/ui/DemoFrame` now.
- The intent dialog came out of the port with no styling at all — its rules had lived in the
  root stylesheet the port deleted. It has a module of its own now, on the site's tokens and the
  site's buttons.
- The theme read its initial scheme from an effect, which is a second render for a value that was
  knowable in the first. `useTheme` and `useCodePane` moved out of their providers' files, so an edit
  to a provider no longer costs a full reload.

## 2026-09-14, integrating with what exists

### Added

- A single-spa 6 demo. A root config runs the bootstrap to completion before `start()`, because the
  answer is what decides whether starting is the right thing to do — with no session it never calls
  `start()` at all. Two applications get what they need two different ways: one through
  `customProps`, one route-activated and given nothing, declaring the same page-scoped steps and
  adopting them. Opening the second costs one request, its own.
- An API reference in the playground, projected from typedoc's JSON and rendered with the site's own
  components. Every export must appear in a hand-written table of contents or the build fails, which
  is how an export nobody can find becomes a build error rather than a gap.
- `SessionState`: the session publishes the mounted phase's report as well as the queue.
- Penumbra's system tokens, lifted unchanged, with a skin written for antumbra — and
  `scripts/check-contrast.mjs`, which measures thirty pairs across both schemes and refused the
  first dark indigo at 4.22:1.

### Fixed

- The graph left its mounted step permanently unresolved. Its traces were in the `HostReport`,
  which `attachIntentHost` threw away.
- The scope control on the micro-frontend page is in the URL now. There were two controls for one
  setting, and the one inside the frame did not move the one outside it.
- The reference read a function's documentation off the declaration rather than its signature, so it
  showed no examples at all and called two dozen documented exports undocumented, `createBootstrap`
  among them. Fixing it exposed twelve types with no prose, which now have some.

## 2026-09-14, the typed step list

### Added

- A `needs` naming a step the list does not contain, and two steps sharing an id, are now **compile**
  errors. `createBootstrap` asks for a property whose name is the complaint —
  `antumbra: two steps in this list share the id: session` — because a conditional on `steps` itself
  would be an inference site TypeScript cannot read the list out of, and the typing of `ctx.get`
  hangs off that inference.
- The playground is a two-page site: one application, and four fragments on one page.

### Notes

- Cycles and the preflight-to-mounted edge stay runtime checks, along with everything about a list
  built dynamically: those have no known positions, so nothing can be claimed about them at compile
  time.
- Long edges in the plan graph route through a lane under it. Crossing a column of boxes meant
  disappearing behind one.

## 2026-09-14, later still

Page scope, so more than one module on a page stops doing the same work twice.

### Added

- `scope: 'page'` on a step. The first bootstrap to reach it does the work and the rest adopt the
  result, through a registry on a versioned `Symbol.for` — which is the only thing two separately
  built modules can agree on without importing each other. The step id is the sharing key.
- `clearSharedScope()`, for tests and for a demo that boots repeatedly.
- `StepTrace.shared`, true when a step adopted a result somebody else produced.
- The playground now runs two bootstraps on one page, React and Solid, with the session, access and
  configuration steps page-scoped. The Solid panel reports what it adopted.

### Fixed

- **The trial warning opened two dialogs.** Two causes, both real. The page was running two
  bootstraps that each queued their own warning, which is what page scope now prevents; and the
  playground raised the dialog from an effect, which StrictMode ran twice before the state that
  would have stopped the second call had flushed. The question is derived from the queue now instead
  of being asked imperatively.

### Notes

- A shared step is attempted once and its ending is the page's answer, timeout included — so its
  `timeout` belongs to the page rather than to whichever module got there first.
- Its notices and intents stay with the run that did the work. Replaying them would put the same
  warning on the screen once per module, which is the bug above.

## 2026-09-14, later

The React and Solid bindings, and the shared machinery they turned out to need.

### Added

- `antumbra/react` and `antumbra/solid`: `BootstrapProvider`, `useBootstrap`, `useBootstrapContext`,
  `useBootData`, `useIntentHost`, plus `fromStore` on the Solid side. Both re-export the root
  wholesale, and `binding-parity.test.ts` fails if one grows a name the other did not.
- `boot.observe()`: the run as one observable snapshot, memoised per bootstrap so a page full of
  components runs it once. It listens to the event hub rather than consuming `events()`, so an
  observer built after the run has already settled still settles instead of waiting forever.
- `attachIntentHost`, the queue-draining half all three bindings share, moved into the core.
- A `/stories` route in the playground and a component suite that drives it in a real browser. One
  test file asserts both bindings against one DOM contract.

### Changed

- `useIntentHost` returns the forwarded intents instead of taking an `onIntent` callback. A callback
  prop is a fresh function every render, so an effect depending on it tore the host down between an
  intent being forwarded and the user answering it.
- `attachIntentHost().destroy()` no longer disposes the session. A component unmounting is not the
  application shutting down. `bindBootstrap().destroy()` still does, because a caller with no
  component behind it means the page is done.
- `session.mount()` is memoised, like `run()`. A re-attaching binding was asking the user the same
  question twice.
- `Outcome` and `RunSnapshot` default to the empty step list rather than `readonly AnyStep[]`. The
  old default claimed every key in `BootRegistry`, which is a promise no particular run makes, and
  it only surfaced once a project augmented the registry.
- The observer's store is read-only in public. `set` made it invariant, which stopped a
  `Bootstrap<MySteps>` from being held in a variable typed as a plain `Bootstrap`.

### Fixed

- `verify:package` matched only single-quoted imports while the bundler emits double, so every check
  it ran against `dist` passed vacuously. A `mustReach` assertion caught it. Both patterns accept
  either quote now, and the same hardening went into `entry-isolation.test.ts`.
- The Solid intent host read the whole snapshot inside its effect, so it tore itself down and rebuilt
  on every event. It derives the session through `createMemo` now.
- The run observer announced `settled` while the last events were still arriving, which froze a
  progress view mid-timeline.

### Notes

- No `oxlint-disable` on `react-hooks/exhaustive-deps` anywhere. Every time a hook fought the rule,
  the hook had the wrong shape.

## 2026-09-14

First working shape: the framework-free core, the vanilla controller binding, and a playground that
demonstrates both.

### Added

- `createBootstrap`, `defineStep` and `defineHostedStep`. Steps declare what they read in `needs`;
  the planner turns that into topological levels and everything on a level goes out together.
- Four registries filled by declaration merging — `BootRegistry`, `NoticeRegistry`, `IntentRegistry`
  and `HostCapabilities`. Declaring none leaves every id open and every payload `unknown`.
- Five statuses: `ready`, `degraded`, `blocked`, `failed`, `aborted`. `run()` never rejects for
  anything a step did, and calling it twice returns the same outcome.
- Notices (facts recorded during the run) and intents (UI work the core cannot do itself, with a
  `pending → forwarded → handled | dropped` life). Both survive the failure of the step that emitted
  them.
- Two phases with two context types. A preflight step can refuse the mount and has no UI port; a
  mounted step has the port and can wait for an intent to be settled, and cannot refuse.
- `boot.events()` and `createBootstrap({ onEvent })`: the run as it happens, as an async iterable or
  a callback. The outcome stays the only answer to whether the app may mount.
- `antumbra/plain` with `bindBootstrap`, a controller over markup the caller already wrote.
- A playground demonstrating one modular application, with switches for every interesting failure:
  no session, a required service down, an optional one down, a step that hangs past its own timeout.

### Notes

- Two `as` casts in shipped source, both at the same boundary: settled data lives in a
  `Map<StepId, unknown>`, and the step id is what re-attaches the declared type on the way out.
- Zero runtime dependencies. The built package is 38 files and about 10 kB gzipped.
