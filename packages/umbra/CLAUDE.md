# CLAUDE.md

Bootstrap orchestration for an application made of modules. A framework-free core, thin bindings
over it, no UI and no runtime dependencies.

## Entry points

The package root is plain TypeScript and **must resolve with no framework installed**. Bindings are
the optional layer.

| Specifier     | Contents                                                                                                                                                              |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `umbra`       | `createBootstrap`, `defineStep`, `defineHostedStep`, the four registries, the event stream, `attachIntentHost`, the errors. No framework; `src/index.ts` is the list. |
| `umbra/react` | `BootstrapProvider`, `useBootstrap`, `useBootstrapContext`, `useStepData`, `useIntentHost` — **plus a wholesale re-export of the root**.                              |
| `umbra/solid` | The same five names, for Solid, plus `fromStore` — and the same wholesale re-export.                                                                                  |
| `umbra/plain` | `bindBootstrap` — a _controller_ over markup the caller wrote — and the same wholesale re-export.                                                                     |

**There are two kinds of binding.** The _hook_ bindings, `./react` and `./solid`, share a surface
down to the file names, so a team running both writes the same bootstrap twice with the same words.
One difference, and it is the renderer's: Solid's values are accessors, so **do not destructure what
its hooks return**. The _controller_ binding, `./plain`, has no hooks and no provider; it connects
the queue to markup the caller already wrote. `src/__tests__/binding-parity.test.ts` knows the
difference and asserts each kind's own shape.

`src/__tests__/entry-isolation.test.ts` walks the real import graph from each entry and asserts that
the root reaches no package at all, that each hook binding reaches its own framework and only its
own, and that `./plain` reaches none. The positive halves are what stop the root's assertion from
passing because the walker resolved nothing. `verify:package` re-checks all of it against the built
artefact — and that check shipped broken for a day, matching only single-quoted imports while the
bundler emitted double, until a `mustReach` assertion caught it. That is why both patterns accept
both quote styles now, and why every negative assertion in this repo has a positive one beside it.

## Commands

```bash
yarn install         # from the repository root; Yarn 4 is vendored in .yarn/releases
yarn dev             # the playground on :3002
yarn build           # ESM bundle (Vite) + .d.ts (tsc)
yarn type-check      # library, playground and type fixtures
yarn test            # the unit suite
yarn check           # type-check + lint + format + docs
yarn verify:all      # check + build + verify:package + smoke
```

## Testing

Playwright runs both suites; there is no vitest. The web server is config-level and skipped for a
unit-only run, because a unit run a broken playground can fail is a unit run reporting on something
it does not test.

| Suffix        | Purpose                                                              |
| ------------- | -------------------------------------------------------------------- |
| `*.test.ts`   | Unit tests, in `__tests__/` beside what they test                    |
| `*.ct.ts`     | Component tests, which drive a story in a real browser               |
| `*.test-d.ts` | Type fixtures in `type-fixtures/`, run by `yarn type-check:registry` |

**A component test mounts a harness by id** through the playground's gallery door — `/?gallery`,
then `window.mount({ story })`. The stories are built by the playground's own Vite, so the code a
test exercises is the code the demo runs rather than a parallel pipeline configured to match; the
door is what keeps the router, the providers and the layout out of the measurement. The `/stories`
route mounts the same harnesses for a human reading the site.

**One component test file covers both hook bindings**, against one DOM contract declared in
`playground/src/pages/stories/model/scenario.ts`. Writing it twice would let the two halves drift
apart one assertion at a time, which is the exact thing the bindings promise not to do.

**The type fixtures compile in their own program**, because declaration merging is global:
augmenting `StepRegistry` in the main project would narrow ids for every other type test there.

`scripts/smoke-playground.mjs` loads the built demo in a real browser. The unit suite proves the
core's behaviour; the smoke test proves the demo is wired to it, and those fail separately — a
playground can compile, build and render an empty page for a whole afternoon.

## Three nouns, and one word each

Everything in this package belongs to exactly one of three things, and the name says which:

| Noun          | What it is               | Names                                                                                                                  |
| ------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| **Bootstrap** | the machine you declared | `createBootstrap`, `Bootstrap`, `BootstrapOptions`, `BootstrapPlan`, `BootstrapError`, `bindBootstrap`, `useBootstrap` |
| **Run**       | one execution of it      | `Outcome`, `RunStatus`, `RunData`, `RunEvent`, `RunObserver`, `RunSnapshot`, `RunStage`                                |
| **Step**      | one unit of work         | `Step`, `StepId`, `StepPhase`, `StepScope`, `StepStatus`, `StepTrace`, `StepFailure`, `StepRegistry`, `useStepData`    |

Two rules fall out of it, and both were broken before the vocabulary was written down:

- **A word means one thing.** `phase` is `preflight` or `hosted` and nothing else, which is why a
  run's position is a `stage`. `Outcome` is the object a run produced, which is why how one step
  ended is a `status` — `outcome.timeline[0].outcome` was one noun at two ranks.
- **No abbreviations.** There is no `Boot` prefix. It was a short `Bootstrap` on types that mostly
  described a run, so the same concept wore three prefixes.

The three lifecycle enums are one family and read the same way: `RunStatus`, `StepStatus`,
`IntentStatus`.

## The model, and the decisions inside it

**Parallelism is derived, never declared.** Steps list what they read in `needs`; the planner turns
that into topological levels and everything on a level goes out together. There is no `parallel`
flag and no concurrency cap — a cap would make `plan()` a description of something other than what
ran.

**`plan()` returns levels, not waves.** It is a static analysis of the graph, computed before
anything runs. `outcome.timeline` is what actually happened, and the two are allowed to differ.

**The graph is declared, not discovered, and there is no way to add a step mid-run.** A process
whose shape is only known once it has started talking — a robot assembling an arm from whatever the
base reports, a worker reading its queues out of its own configuration — gets **one bootstrap per
tier** instead: a tier that discovers the next one hands its outcome over, and the next
`createBootstrap` is declared from that answer. Growing a compiled graph would make `plan()` a
description of something that did not happen, which is the only promise the planner makes. An id no
registry names is still a legal id, which is what lets a tier be built from data;
`src/core/__tests__/discovered-tiers.test.ts` is the worked example, and it runs in Node.

**Two phases, two context types.** A preflight step has `block` and no `host`; a hosted step has `host`
and `awaitIntent` and no `block`. This is why there are two `define*` functions rather than a `phase`
field: one generic signature would hand every step the union of both contexts, which takes `block`
away from preflight and `host` away from hosted in the same breath. An edge from preflight to hosted
is rejected at construction, because it can never be satisfied.

**A hosted step returns `void`.** `run()` resolves at the end of preflight, so a value produced
later would arrive after the outcome was handed over.

**The outcome is frozen; the session is alive.** Everything that moves — the intent queue's
transitions, the waiters behind `awaitIntent`, the hosted phase — lives on the session. An outcome
nobody passes to a session leaks nothing, which is what makes the snapshot safe to hand around.

**`run()` never rejects for anything a step did**, and calling it twice returns the same outcome.
Programming mistakes throw synchronously from `createBootstrap` instead. React 19 doubles effects in
StrictMode, so throwing on a second `run()` would push that problem onto every binding.

**Cancellation is not failure.** `errors` holds `failed` and `timed-out` only. A step the run stopped
never got the chance to fail, and listing it beside a real 401 would make every refused boot read as
a crash. The timeline records it.

**On failure the policy is drain, and it is not configurable.** The level in flight finishes and its
notices count; nothing further is scheduled. A required failure does not abort its siblings — a
sibling halfway through a fetch still has something to say about why the boot is in trouble. A
refusal does abort them, because nothing is going to mount.

**A refusal is recorded before the abort, not after the throw.** Aborting resolves the race inside
`attemptStep`, which can settle the refusing step as cancelled before its own rejection is ever seen,
so the refusal cannot live anywhere that depends on who wins that race. A refusal arriving after the
run settled is ignored: rewriting an answer already handed out is worse than losing a late one.

**Two refusals in one level settle by plan order**, never by arrival, or the telemetry and the tests
both become coin flips.

**A notice and an intent survive the failure of the step that emitted them.** A token refresh that
queues "redirect to sign-in" and then throws is precisely the case where the intent must not be lost.

**Intents deduplicate by type, first write wins**, with the count on the record. There is no dedupe
key to scope it by: a type that needs to queue twice with different payloads is describing two
things.

**Nothing in `run-step.ts` ever rejects an unawaited promise.** The step's work is folded into a
promise that resolves with either branch, and the abort side resolves rather than rejects. A step
that loses the race and fails a second later would otherwise take the process down with an unhandled
rejection, which turns a red test into a dead test runner.

**A step's timeout starts when `run` is entered**, not when the plan was computed. A step waiting
behind a dependency has spent none of its own budget.

**The deadline is the backstop the per-step timeouts cannot be.** A step that ignores its signal, or
never returns from a synchronous loop, is only bounded by the run-level deadline.

**The context is revoked at settlement and late writes are counted, not thrown on.** A late `notice`
almost always comes from a `finally` in user code reacting to its own abort; making that throw would
break the caller's cleanup to report a bookkeeping detail.

**A hook returns intents; it does not take an `onIntent` prop.** A callback prop is a fresh function
every render, so an effect depending on it would tear the host down between an intent being
forwarded and the user answering it — and an effect ignoring it would need the dependency check
switched off. Rendering the queue has neither problem. The same reasoning makes `host` a
stability requirement rather than a convenience: a fresh one every render is a fresh hosted phase
every render.

**`destroy` is not `dispose`, and finding that out cost a bug.** A component unmounting is not the
application shutting down: a framework rebuilds an effect whenever its inputs change, and a
`destroy` that disposed would drop every pending intent each time. `attachIntentHost().destroy()`
unsubscribes and stops there. `bindBootstrap().destroy()` also disposes, because a caller with no
component behind it means the page is done — that is the one place the word reads that way.

**`session.attach()` is memoised, like `run()`.** A framework re-attaches its host more often than an
author expects, and a hosted phase that ran twice would ask the user the same question twice.

**A bare `Outcome` means an outcome whose step list is no longer in the type**, so its default type
argument is the empty list and its data is opaque; `readStepData` is how a value comes back out.
Defaulting to `readonly AnyStep[]` instead would claim every key in `StepRegistry`, which is a
promise no particular run makes — and it only shows up once somebody augments the registry.

**The observer's store is read-only in public.** `set` is what makes a store invariant in its value,
and with it in the surface a `Bootstrap<MySteps>` could not be held in a variable typed as a plain
`Bootstrap` — a papercut nobody should have to diagnose.

**The Solid binding derives the session through `createMemo` before its effect reads it.** Reading
the whole snapshot inside the effect subscribes it to every event and every queue change, so the
host is torn down and rebuilt dozens of times during one boot. It is the reactive twin of listing an
unstable callback in a dependency array, and it produced the same bug.

**`scope: 'shared'` shares work across bootstraps through a `Symbol.for` registry on `globalThis`.**
Module scope would give each separately built copy of this file its own map and share nothing, which
is the whole difficulty: two modules on a page have no way to import each other. The symbol is
versioned, so a future shape simply does not share with the old one — not sharing is slower, sharing
something misread is wrong.

**The claim is taken synchronously, and that is what makes it a lock.** Two bootstraps reaching the
same level in the same tick both call `claimSharedStep`; an `await` anywhere before the registration
would open a window where both decide they own it.

**A shared step is attempted once and its ending is everyone's answer**, refusal and timeout
included — so a shared step's `timeout` belongs to all of them rather than to whichever module got
there first. **Its notices and intents stay with the run that did the work**, because replaying them
would put the same warning on the screen once per module, which is the bug that prompted the feature.

**The event stream drains before it checks whether it is done.** A `yield` suspends the generator,
and anything pushed while it is parked lands in the buffer after the current batch was taken — an
exit that only asked whether the run had ended would drop the very event that ended it.

## Types

The four registries — `StepRegistry`, `NoticeRegistry`, `IntentRegistry`, `HostCapabilities` — are filled by
declaration merging and ship empty. Two consequences worth knowing before touching them:

- **`keyof` an empty interface is `never`, not `string`.** The open id space comes from
  `keyof StepRegistry | (string & {})`: a plain union with `string` collapses, and the branded member
  survives that reduction long enough for the editor to keep suggesting the declared names.
- **`const TNeeds` on `defineStep` is the whole mechanism.** Without it `needs: ['session']` widens
  to `string[]`, `TNeeds[number]` becomes `string`, and `ctx.get` quietly accepts anything. The
  failure is silent, which is what makes it worth a type parameter nobody reads.

`run` is declared as a **method** rather than a function property. Method parameters are bivariant,
which is what lets steps with different `needs` tuples live in one array; as a function property they
would be mutually unassignable and the runner could not hold them.

`data` is derived from the step list (`IdsOf<Steps>`) rather than from `StepRegistry`, because a
registry entry with no step behind it would be a promise the run cannot keep. A mapped type rather
than `Pick`, which collapses to `{}` while the registry is still empty.

## Conventions

- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
- **Changelog**: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), by date
- **Files**: kebab-case. **Exports**: PascalCase types, camelCase functions
- **Comments**: **why, not what** — and never the past (`used to`, `previously`); the CHANGELOG is
  the history. JSDoc on public API is the exception, being the documentation.
- **No implicit returns**: every arrow function uses a block body with an explicit `return`
- **Optional props**: `| undefined` suffix
- **Two parameters**, and an options object counts as one of them
- **Type safety**: the package has **three** `as` casts, all at the same boundary, all commented —
  settled data lives in a `Map<StepId, unknown>` because a heterogeneous step list has nowhere else
  to hold it, and the id is what re-attaches the declared type on the way out. `readStepData` exists
  so the bindings do not each grow one. A fourth needs a reason of its own.
- **No `oxlint-disable` in shipped code, and never on `react-hooks/exhaustive-deps`.** A suppression
  there silences the rule for the dependency somebody adds next year, not just for the one in front
  of you — the warning that would have caught it never fires again. When a hook fights the rule, the
  hook has the wrong shape: destructure the prop so the dependency is the function rather than the
  object it arrived in, return state instead of taking a callback, or derive the stable value first.
  The disables that remain are on type declarations, where the rule fires on the mechanism itself
  and can hide nothing, plus one test that throws a string on purpose.
- **Every relative import in shipped `src/` carries a `.js` extension** — `tsc` copies specifiers
  into the `.d.ts` verbatim, and an extensionless one is invalid on `node16`/`nodenext` resolution,
  silently under `skipLibCheck`. `yarn verify:package` fails on any that slip through.
- **Declarations come from `tsc -p tsconfig.build.json`**, never a Vite plugin, so the published
  types cannot drift from what `type-check` validated.

## Environment

Node >= 24, **Yarn 4** vendored in the repository root, ES2024, ESNext modules, Vite 8.

**TypeScript 7, and nothing beside it in the lint path**: every `tsc` call in `scripts` is
`node node_modules/typescript-7/bin/tsc`, and `oxlint --type-aware` runs its type-aware half through
tsgolint, built on the same compiler. The bare `typescript` 6.0.3 is typedoc's, which peers on
`6.0.x`, and the editor's, since `typescript-7/lib` ships no `tsserver.js`.

**Yarn workspaces**: this package and `umbra-playground` (`playground/`, private) are two of the
monorepo’s workspaces, installed by one `yarn install` at its root. The published dependency list is
this manifest, whose `dependencies` stay empty — anything the demo needs belongs in
`playground/package.json`.

## The playground

A React 19 site on TanStack Router, laid out in Feature-Sliced Design layers that only ever import
downward: `app` → `pages` → `widgets` → `entities` → `shared`. The layer a file sits in is the answer
to who is allowed to reach it, which is why a widget never reaches up into `app` for a provider.

```
playground/src/
  app/        entry, router, providers, the stylesheets
  pages/      one folder per route: home, getting-started, microfrontends, single-spa,
              design-system, api, stories
  widgets/    root-layout, sidebar, top-bar, code-viewer
  entities/   example — the card, grid and section every page composes
  shared/     lib/ and ui/, the pieces with no page of their own
```

**Three stylesheets, and the split is the point.** The `penumbra` package carries what a second
project takes unchanged — spacing, radii, shadows and type scale in `tokens.system.css`, then
neutrals, semantics and the lift in `tokens.skin.base.css`. `tokens.skin.css` here is twelve
declarations: the three faces, the lockup rise, and the eight colours that are umbra's.
`penumbra-contrast`, penumbra's own gate, reads the base underneath it and measures 32 token pairs
across both schemes, so a palette edit that fails WCAG AA fails `yarn check` rather than review.

**Every example is a card with a `codeKey`**, and one dialog in the layout shows the source. A dialog
per card would be sixty dialogs in the DOM on the reference page, holding the largest text the site
ships.

**A modal has both ends pinned**: the sheet itself carries `overflow: hidden` and the middle
scrolls. Give the sheet a `display` and the user agent's `dialog:not([open]) { display: none }`
loses, and a closed dialog is painted on the page — so the layout goes on `.dialog[open]`.

**The reference is one page per chapter**, `/api` being the map: the rail on the left, fuzzy symbol
search above it, and cross-references in a signature linking to the symbol's own entry. All of it is
projected from typedoc's JSON by `playground/vite-plugins/api-model.ts`, whose hand-written
`CATEGORIES` is the table of contents — an export filed nowhere throws the build rather than going
missing quietly.

**`main.tsx` has two doors and neither loads the other's graph** — `?gallery` for the component
suite, the router for everybody else — both imported dynamically, because a static import runs
whether or not its branch does.

## Design philosophy

- **Core is framework-agnostic**: anything that does not need a framework stays under the root and
  importable without a renderer. The test is mechanical — if adding it to one binding would mean
  adding it to another, it is core.
- **The core does not need a DOM, and that is a measurement rather than a prohibition.** A binding
  uses the DOM where the DOM is the job; the layer that decides what runs and in what order has no
  reason to, so it works in a worker, a service or a server render.
- **Headless**: zero shipped UI. The app already has the dialog it wants to show.
- **Minimal surface**: extend a step's options before adding a second kind of step.

## The one piece of global state

`src/core/shared-scope.ts`, and it is deliberate: a registry two independently built modules can find
without importing each other has to live somewhere they both already look. Everything else in this
package is per-bootstrap, and it should stay that way — a second global needs an argument as good as
this one.
