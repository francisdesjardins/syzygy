# Changelog

Kept per [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), by date. No semver: names change
between commits when a better one shows up, and the entry says which and why.

## 2026-09-18, one switch table, and a frame that does not scroll

### Changed — the two demos drive their frames the same way

The one-application page had a table of checkboxes with a "watch for" column beside each; the
micro-frontend page had a row of buttons. Four settings written as exclusive pairs is eight buttons,
which ran out of width and wrapped into a second row nobody reads as a set — and they are not
alternatives anyway: a page can have no session _and_ a service that stopped answering.

`shared/ui/SwitchTable` is the one of them now, checkboxes on both pages. Where the checked state
lives stays the caller's business: component state on one page, the address on the other, because
that frame carries links of its own. Its rules move out of `getting-started/ui/demo.css` into a
module beside it, and two class names that had no rule at all — `switch-label`, `switch-effect` —
go with them.

The switches navigate with `resetScroll: false`. They sit above the frame they drive, so scrolling
to the top of the page on every tick puts what you just changed out of view.

### Fixed — the frame scrolled where only its log is meant to

The extra chip and its reason pushed the tallest fragment past a height that had been right before
it. `FRAME_HEIGHT` is 580 now, measured rather than chosen: across sixteen combinations of the four
switches at four widths, nothing scrolls but the log on the right, which is the layout the frame was
built for.

The frame's own banner shrank to make room. It had grown a clause per condition, which is work the
switch table beside it now does — and does better, because each explanation sits on the line of the
switch that causes it.

## 2026-09-18, the demos show every ending, not just the good one

### Changed — three conditions on the micro-frontend frame

`?session=none` was the first; `?preview=on` and `?access=hang` join it, as toggles rather than
exclusive pairs — a page can have no session _and_ a service that stopped answering, and four pairs
of buttons say in eight what three say in three.

- **No session** — one refusal, adopted by the other three. One request instead of four.
- **Preview build** — a `diagnostics` branch all four declare, skipped once with its reason. A skip
  is not a failure, so the run stays `ready` and nothing downstream of it runs.
- **Access hangs** — the step ends on its own budget and whoever shared it ends `timed-out` too.
  The top bar and the trial panel never declared `access`, so they are untouched: the ending is
  everyone's answer, and everyone is whoever asked.

The counter is now **added up from who declares what** instead of held in a table. It claimed 4 and
8 while the page sent 3 and 7, because a hanging `access` prunes `projects:reference` and the table
had no way to know. Sixteen states and a hand-written number for each is how a demo comes to state a
total it stopped producing.

### Changed — one verdict, not a refusal special case

`demo.refused` only knew about `blocked`, so a fragment whose required step timed out rendered an
empty list and said nothing. `demo.verdictOf` answers for every ending: `ready` and `degraded` mount,
and everything else replaces the fragment with the step that decided and what became of it.

### Changed — single-spa says the word, not only the reason

The shell read `outcome.blockedBy.reason` and printed it. It now names the step and its own
`blocked` status beside the run's — one word at two ranks, so a reader can start from either end —
and its chips carry status and reason like the other frame's. That was the fourth copy of the chip
row in this playground; it is the last one to learn what the other three know.

## 2026-09-18, a shared step's timeout was only the owner's

### Fixed — a sharer adopted the owner's failure, but never its timeout

`CLAUDE.md` and the README both said a shared step's ending is everyone's answer, "refusal and
timeout included". Measured, it was not:

| the owner's step     | owner       | sharer                        |
| -------------------- | ----------- | ----------------------------- |
| honours its `signal` | `timed-out` | **`failed`**                  |
| ignores it and hangs | `timed-out` | waits out a budget of its own |

The owner published its ending from inside its own `run` — a `try`/`catch` around the body. A
timeout and a cancellation are decided by the **abort**, outside the body, so neither ever reached
the key. The first row is the body rejecting and being read as an ordinary failure; the second is
nobody settling the claim at all, and the sharer only escaping because its own clock ran out.

The owner now publishes from its **attempt**, where the ending is finally known, and it publishes
the status the scheduler settled on rather than the one the body happened to produce — the same
record `blocked` already read from. `SharedResult` gains `timed-out` and `cancelled`; a sharer
cannot reach either on its own, so it adopts the word the way it already adopts a refusal, through
the `adopted` map rather than through however its own attempt happened to finish.

Both `Symbol.for` keys move to `v3`, the union having changed shape.

**`cancelled` is new to the union and it closes a hang, not a wrong word.** A bootstrap that owns a
shared step and is stopped before it ends — a sibling refused the mount — used to leave every sharer
waiting on a key nobody would settle, until each one's own deadline noticed. Nothing was learned, so
nothing is claimed: the sharer reports `cancelled` and `errors` stays empty.

### Guarded

Two tests in `shared-scope.test.ts`. The timeout one gives the owner a 120ms budget and the sharer
5000ms, so the word the sharer ends with cannot be two clocks agreeing by accident. The cancellation
one asserts the sharer is told in well under its own budget, which is the difference between an
answer and a hang.

## 2026-09-18, the four fragments can lose their session

### Changed — the micro-frontend demo gains the ending nobody plans for

`?session=none`, beside the scope toggle it already had. All four fragments declare the same
refusal on the same id; with shared scope exactly one of them runs it and the other three adopt it.

The counter is the argument, because it is the one number on the page that cannot be talked into
agreeing: **1** request signed out and shared, **4** signed out without sharing, against 4 and 8
signed in. The fragment with its own separately built copy of the library adopts the refusal too,
which is the page's whole claim under the ending nobody writes the demo for.

"A shared step is attempted once and its ending is everyone's answer, refusal and timeout included"
was prose with no demo behind it. Half of it has one now.

### Changed — the chips say what became of a step, not only who did the work

`step · ran it` and `step · adopted` could not describe a step that refused, timed out or was
pruned. A non-success leads with its status and keeps the adoption beside it —
`session · blocked, adopted` — and the reason rides in a chip of its own, so the fragment that
decided is legible next to the three wearing the word because they were stopped.

`demo.chipsOf` and `demo.refusalOf` are the sentences; `demo.chips` and `demo.refused` are the
nodes. The React fragment cannot take a DOM node, and the panel behind the shadow root now takes
the page's builder instead of keeping a third copy — three spellings of one row was two too many.

### Changed — `readScope` is `readDemoSearch`

It reads two settings now, so `model/scope.ts` was the wrong name for the file and the function.
Its doc also described an unrecognised value resolving to `page`, which is not a value `DemoScope`
has ever had — rename residue, like the unsorted exports one entry below.

## 2026-09-18, a pass over the package for what had drifted

### Added — `StepTrace.reason`

The string a step passed to `ctx.block` or `ctx.skip`, on the step's own trace.

`skip(reason)` took a parameter and dropped it: nothing carried it anywhere a consumer could read,
so the demo passed `'not a preview build'` to no one. Worse, a step that _decided_ to skip and a
step pruned behind it both read `skipped` and nothing else — which is the defect `blocked` was split
from `cancelled` to fix, one entry below, reintroduced the same day in a different place.

Present only on a step that decided; absent on one pruned or stopped. A block reads it off the same
authoritative `blocks` record the status does, because `attempt.reason` is empty whenever the abort
won that race. The playground's timeline prints it beside the status.

### Removed — `StepSkippedError`

Unreachable, and exported. `ctx.get` throws `UndeclaredDependencyError` for an id outside `needs`
first, and an id _inside_ `needs` belongs to a step that only ran because every need succeeded — so
the branch could not be taken. Coverage agreed: its constructor ran zero times across the suite
while the other four errors ran 15, 5, 1 and 10.

The guard stays, as a `BootstrapError` naming the invariant, so a change to that gate is loud rather
than an `undefined` handed back as data. Gone from `index.ts` and from the reference's contents.

### Changed — the `as` casts are listed, not counted

`CLAUDE.md`, `read-data.ts` and `step-context.ts` each said "three, all at the same boundary". The
package holds six, on two: settled data re-typed by its step id, and `globalThis`, which nothing can
describe for another module. A count in prose goes stale the first time anyone refactors, so
`check:casts` holds the list of files allowed to assert each boundary — a cast anywhere else fails
`yarn check`, and a file that declares a boundary and holds no cast fails too.

### Fixed — `BlockSignal` had lost its documentation

Inserting `SkipSignal` between `BlockSignal`'s doc block and `BlockSignal` left the doc attached to
nothing and the class bare. `docs:check` passed, because the class is internal. The two now sit in
the order their docs reference each other.

### Fixed — two public examples read a property that does not exist

`outcome.failures` and `failure.id`, in the JSDoc of `UndeclaredDependencyError` and
`StepSkippedError`. The real names are `outcome.errors` and `failure.step`.

`docs:examples` type-checks every `@example`, and passed: an example that assumes a free identifier
gets it declared `any`, and everything derived from it is `any` too — `boot` was free, so
`await boot.run()` was `any` and the outcome was never an `Outcome`. The surviving example now
builds its outcome from `createBootstrap`, where the type is real.

### Changed — one spelling for pruning, and sorted exports

Both runners prune by the same rule and each wrote it out: `skippedTrace` in `run-step.ts` is now
the one spelling, and the mounted phase partitions its level the way the preflight does instead of
filtering then testing membership. `index.ts`'s type exports were alphabetical under the `Boot*`
names and left unsorted by the rename; they are sorted again.

## 2026-09-18, a branch that does not apply

### Added — `ctx.skip(reason?)`

A preflight or hosted step can end by saying the work does not apply here. The step settles
`skipped`, `errors` stays empty, and the run stays `ready`.

Nothing else was needed for the rest of the branch: `needs` is an `and`, so everything downstream of
a step that did not succeed was already pruned. `skip` adds the one ending that rule had no way to
express — the steps it prunes have settled `skipped` since the first scheduler, and this is the same
word for the same thing, chosen by the step rather than inherited from a dependency.

The shape had to be written as an `optional` step that throws, which prunes correctly and then ends
the run `degraded` with an error filed against a thing that went exactly as intended.

`SkipSignal` mirrors `BlockSignal` down to its constructor, and it is thrown rather than returned
for the same reason: the step's body stops where it says it does.

### Changed — a shared step's skip is everyone's skip

`SharedResult` gains `{ kind: 'skipped' }`, so a module adopting a shared step adopts the skip the
way it already adopted a refusal — a preview-only step is not a preview-only step for one module on
the page and not the others.

That is a shape change, so both `Symbol.for` keys move: `umbra.shared-scope.v1` → `v2` and
`umbra.shared-scope.settlers.v1` → `v2`. A copy of the library holding the old shape now shares
nothing with a copy holding the new one, which is the file's own rule — not sharing is slower,
sharing something misread is wrong.

### Changed — the demo boots a branch it is meant to go without

`getting-started` carries `debug-overlay` and `debug-recorder` behind a new **Preview build**
switch. Off, both settle `skipped`, the graph greys them out and the outcome is `ready` with no
errors. On, the same two boot green with nothing else edited. Both ids are in the playground's
`StepRegistry`, so the example reads its own data rather than casting.

### Guarded

Three tests in `run.test.ts` — the branch skipped with its dependent pruned behind it, the branch
taken, and a _required_ step that skips without failing the run. One in `shared-scope.test.ts` for
the adopted skip, and one in `live-run.test.ts`, because `skip` sits on `BaseContext` and a hosted
step that skips has to prune its own branch the same way.

### Fixed — `ready` did not mean what the table said

"Every step succeeded" was the README's line for `ready`, and the playground repeated it. The status
is computed from `errors.length`, which a skipped step never joins — so a run can be `ready` with
steps that never ran. Both now read "no step failed".

## 2026-09-18, `StepStatus` gains `blocked`

### Changed — the step that refused no longer wears the word for the steps it stopped

`StepStatus` is `'success' | 'failed' | 'timed-out' | 'skipped' | 'cancelled' | 'blocked'`.

A step that called `ctx.block()` settled as `cancelled`, which is also what every step it aborted
settled as. Reading a timeline, nothing told you which one had decided — only `outcome.blockedBy`
did, one level up.

**The argument is this package's own, made twice already.** `RunStatus` separates `blocked` from
`failed` because "the first is a bug report and the second is a tag rule doing its job".
`IntentStatus` separates `dropped` for the same reason: "a real ending and not a failure".
`CLAUDE.md` says the three are "one family and read the same way" — and two of the three drew the
line while the third did not. `cancelled` now means only something done _to_ a step: the run was
aborted, or a sibling refused, and this one never got to end on its own.

`blocked` rather than `refused`, because `ctx.block`, `BlockSignal`, `RunStatus.blocked` and
`outcome.blockedBy` already spend that word. A synonym is the thing the vocabulary rule exists to
catch.

### Fixed — the refusing step's status was never reliable

Worth stating plainly: this was not a rename, it was a coin flip being given a name.

`block()` aborts the level so that nothing further is scheduled, and that abort resolves the race
inside `attemptStep` — which could settle the refusing step through the _abort_ path before its own
`BlockSignal` rejection was ever seen. So the blocking step's status depended on who won, and in
practice the abort won every time.

The `block` callback already worked around this by pushing the signal into a `blocks` array before
aborting, with a comment saying the refusal "cannot live anywhere that depends on who wins that
race". The status now reads back off that same record. Marking `run-step.ts` alone would have
produced a `blocked` that appeared only when the race went the other way.

### Changed — `BlockSignal.blockReason` is `reason`

Internal, so no consumer sees it. The prefix restated the class it was already on, and the same
string is `reason` on `outcome.blockedBy` — one thing under two names, which is the smell the
`Boot`-prefix pass removed everywhere else.

### Guarded

Two tests in `discovered-tiers.test.ts`: the step that refuses reports `blocked` and stays out of
`errors`, and a sibling stopped by that refusal reports `cancelled`. The second is the one that
would have caught the original defect, because it asserts the two words on the same run.

`demo.css` gained `.node-blocked` — solid and in the error colour, since it is the box to look at
rather than one that faded — and `.step-status-cancelled`, which had no rule at all and had been
falling through to the default.

## 2026-09-18, the plan carries its nodes

### Added — `BootstrapPlan.nodes`

`plan()` returned `levels` and nothing else: for each level, its number, its phase and the ids on
it. That says which steps go out together and **cannot say why**. `access` and `config` share a
level; only `needs` explains that one waited on `session` and the other on `session` and `device`.
So nothing a caller received could be drawn as a graph, in any format.

Each `PlanNode` carries `id`, `phase`, `level`, `needs`, `dependents`, `scope` and `optional`, in
the same order as the ids in `levels`, so the two read as one table. Additive: `levels` is
unchanged.

**None of it is new computation.** `compilePlan` already resolved every field onto its internal
`PlannedStep` — it was being dropped on the way out. `dependents` in particular is the expensive
one to rebuild, since deriving it means walking every other node, and the planner had already
walked them.

**The playground was the proof.** `GettingStartedPage` carried a `shapeOf(steps)` that re-read the
raw step array to rebuild `needs` and `scope`, and handed `PlanGraph` three props — `plan`,
`needsOf`, `scopeOf` — because the first could not answer for the other two. The component whose own
doc comment says "the arrows are the reason" could not get the arrows from the object called the
plan. `shapeOf` is gone and `PlanGraph` takes `plan` and the timeline.

`PlanNode` is not a copy of the step: no `run`, and no `timeout`. This is the shape of the graph,
and a caller that wants to invoke something already holds the step it wrote. `timeout` is execution
policy rather than graph shape; it can be added the day something needs it.

**No Mermaid, no DOT, and that is deliberate.** With the edges public, either one is a handful of
lines in user code:

```ts
const mermaid = (plan: BootstrapPlan): string => {
  // Mermaid node ids are identifiers, and a step id is a free-form string — this package's own
  // examples declare `projects:reference`. So the id is sanitised and the real one is the label.
  const key = (id: PropertyKey): string => `n${String(id).replace(/\W/g, '_')}`;
  return [
    'graph LR',
    ...plan.nodes.map((node) => `  ${key(node.id)}["${String(node.id)}"]`),
    ...plan.nodes.flatMap((node) => node.needs.map((need) => `  ${key(need)} --> ${key(node.id)}`)),
  ].join('\n');
};
```

**That sanitiser is the argument.** Shipping a format means owning its identifier rules, then its
direction, then subgraph grouping, then a theme — the unbounded growth this package already refused
when it turned down an upward "module ready" channel. The library emits the graph; the drawing is
the caller's, and the playground is where a worked example of one belongs.

## 2026-09-18, one rule for what a non-`Error` throw is called

### Changed — shared with antumbra

`utils/thrown-message.ts` is new, and `serializeError`'s `describe` is now a call into it. Nothing
about umbra's own answers moved: a string stays its own message, a number stays stringified, and
anything else is still `Non-error thrown`. The file exists so antumbra can carry the identical text.

Both packages catch `unknown` and have to name it — antumbra to build the `Error` an action reports,
umbra to fill the `SerializedError` a timeline ships — and they answered differently. antumbra
coerced with `String(value)`, which says `[object Object]` for a plain object and **throws**, from
inside the handler that exists to report a failure, for a null-prototype object or a `toString` that
refuses. umbra's answer was the correct one, so it is the one both now give.

Neither package can import the other's copy: both publish `dependencies: {}`, and a shared module
would cost the zero-dependency promise on each README. So the rule is shared by being the same text,
and `yarn check:error-rule` at the root fails on a byte of drift, naming the line. Byte-identical
rather than equivalent, because equivalence is a judgement a diff cannot make — the same measure
`limb` used to decide what could collapse into one package.

**No new public method anywhere.** antumbra keeps `normalizeError`, umbra keeps `serializeError`,
and neither gained the other's: nothing in antumbra ships an error across a boundary, so a
`serializeError` there would be surface with no caller. What is shared is the rule, which is what
was actually duplicated.

### Fixed — a sharer was losing the cause chain

`errorFrom`, which rebuilds something throwable so a `scope: 'shared'` step's sharer fails the way
the owner did, dropped `cause`. The sharer never ran the step, so what it is handed is all it has to
debug from — it read `401` with nothing underneath while the owner had the reason. The stack is
still dropped, on purpose: the owner's frames never ran in the sharer.

## 2026-09-18, `Session` is `LiveRun`

### Changed — renamed export

`Session` → `LiveRun`, `SessionState` → `LiveRunState`, `boot.session()` → **`boot.live()`**, and
`core/session.ts` → `core/live-run.ts`. `RunSnapshot.session` is `.live`.

This was the one decision `HANDOFF.md` left open, and the name did not need inventing: the file's own
doc comment had called it "the live half of a run" three times, and the API reference's category for
it is titled "The live half". The handoff's first sketch was `LiveRun` too.

**What it collided with is in this package's own examples.** Every one of them declares a step called
`session` — it is the natural name for a token step, and `needs: ['session']` appears in the README,
in `define-step`'s JSDoc, in the registry example and in four test files. None of those changed: the
word belongs to consumers, which is the whole reason the library gave it up.

Two things surfaced on the way. `run-observer.ts` already had a local called `live` — a flag meaning
"not yet disposed" — so it is `alive` now, which is what it meant. And twelve comments still said
`mounted` where the code has said `hosted` since an earlier rename.

**Migrating:** `boot.session()` becomes `boot.live()`; the type is `LiveRun`; a snapshot's `.session`
is `.live`. Nothing about the behaviour changed.

## 2026-09-17, the design-system page becomes "Our skin"

### Changed

The route is `/skin` and the page keeps what is actually this project's: six colour declarations,
the shell's own controls, and the two rules the palette is held to.

Five sections went to [penumbra](../penumbra)'s new playground, where they were always about to
end up: type, space and radii, motion, layout and stacking are the system half, the same file in
every project that imports it. So was most of what was left — **of the 22 tokens this page
documented in prose, 16 belonged to penumbra**, including every semantic and every neutral. The page
was titled "Penumbra" and it was not wrong.

What that leaves is small enough to read in one screen, and the way across is a link rather than a
copy.

## 2026-09-17, the mascot is corona's, the face is ours

### Changed

`PeekingMoon` — the drifting, the shyness, the eclipse-on-click, 343 lines of it — now comes from
[corona](../../corona), along with the drawing it wraps. What stays here is the face, about
twenty-five lines of brows, eyes and mouth, over corona's `EclipseMoon`.

The two playgrounds had 339 of those 343 lines in common and had never noticed.

## 2026-09-17, the top bar is a path

### Changed

The bar's brand and its link out are one component now, [corona](../../corona)'s `PlaygroundPath`:
`Home / playground / Antumbra · Umbra`. The mark stays here — an eclipse and an annular ring are not
the same drawing — and the words come from corona, which is what makes the three surfaces agree.

The same path repeats in a new page footer, for a reader who reached the bottom of a long reference
page rather than the top.

## 2026-09-17, `normalizeError` is `serializeError`

### Changed — renamed export

`normalizeError` → `serializeError`, and `utils/normalize-error.ts` → `utils/serialize-error.ts`.

The old name was the same word [antumbra](../antumbra) publishes, over a different function. Theirs
coerces anything to an `Error` and is two lines; this one walks a `cause` chain up to eight deep and
returns a `SerializedError`. An application holding both imported one name that meant two things and
returned two shapes, and the type it actually got depended on which package the specifier resolved
to.

The rename is this side's because this package is not published and carries no semver, so the cost
of moving is a find-and-replace rather than somebody else's migration. The new name is also the
plainer one: the function exists because `JSON.stringify(new Error('x'))` is `{}`, which is a
serialisation problem, and it already returns the type that says so.

**Migrating:** `import { normalizeError } from 'umbra'` becomes
`import { serializeError } from 'umbra'`. Nothing about the behaviour or the return type changed.

## 2026-09-17, the instruction file gets a budget

### Added

`yarn doc-budget`, from [gnomon](../gnomon). This package's `CLAUDE.md` had no budget and no checks
at all — 3 484 words that nothing measured, no link verified, and no `` `yarn <script>` `` mention
held to being a real script. The sibling had all of it as a Playwright test; this is that test made
shared, which is the same move `penumbra-contrast` made for colour.

Nothing had to change to pass: 3 484 against a ceiling of 4 000, comfortably under the 90% headroom
line. The numbers are in [doc-budget.json](doc-budget.json).

## 2026-09-17, the design-system page keeps only what is umbra's

### Changed

`DesignSystemPage` renders [corona](../corona)'s tables. The swatch, the row, the card of rows and
the hook that reads the live values were the same code as antumbra's, and the 221-line stylesheet
under them was byte-identical. What stays here is what is this project's: the two colour lists with
their notes, the recipes — the shell's own controls — and the rules.

### Added

A **Layout & stacking** section. corona's gate found that eleven system tokens were on no page in
the repository, and these were most of them.

The page links across to the site's own `/design-system` when it is being served inside the site,
and does not when it is standalone, which `isOnSite` decides from where the build is being served.

### Fixed

**The token tables showed the outgoing scheme's values after a theme flip, and always had.** The
provider writes `data-color-scheme` from an ordinary effect, and React runs a child's effects before
its parent's — so the tables measured before the attribute moved. corona's `useTokens` watches the
attribute now. Nothing in the provider changed; nothing needed to.

## 2026-09-17, the skin is twelve declarations

### Changed

The playground's `<title>` names what the library does — "umbra — bootstrap orchestration over a
declared step graph" — rather than the package and the word _playground_. The site lists it in its
sitemap now, so the title is the first line of a search result rather than a tab label.

### Changed

`playground/src/app/styles/tokens.skin.css` lost 47 declarations to
[penumbra](../penumbra)'s new `tokens.skin.base.css`, and `app.css` imports that file between the
system half and this one. What is left is the ring: three faces, the lockup rise, and eight colours.

Every name that moved was identical to antumbra's, in both schemes, and had been since the day the
second skin was written — so the palette that was "meant to look nothing like" the other one was
two thirds a shared ground. The ring is the third that was ever this project's.

**The contrast gate reads the base underneath the skin now, and it moved.** Fourteen of its sixteen
pairs have a base colour on at least one side; measuring the skin alone would report on a palette
the browser never shows. `scripts/check-contrast.mjs` is gone and `check:contrast` is
`penumbra-contrast` — the pair table is a statement about what penumbra's names mean, and it was one
copy away from living in two places.

## 2026-09-16, the gates moved to gnomon

### Changed

`scripts/` lost six files to the `gnomon` package: the example checker, the coverage instrumenter
and report, the reset step, and the formatter wrapper. They ran from `node scripts/…`; they run as
`gnomon-examples` and `gnomon-ct-coverage-report` now, and the two modules a config imports come
from `gnomon/vite-plugin-ct-coverage` and `gnomon/ct-coverage-reset`.

This package got the better half of two divergences it never had. The formatter wrapper now raises
on a parse error instead of handing back the text it was given — without which the example checker
reads an unparsable `@example` as one that needed no formatting, silently. And the coverage report's
"nothing was written" list gained the cause the other library had found.

**The instrumenter takes its root as an argument now.** It used to resolve the library directory
from its own location, which says nothing once the file lives in another package. `playground/vite.
config.ts` passes it, and assigns the result to an annotated `Plugin[]` — the plugin's type is
inferred from the position the call sits in, so a bare spread into an array literal has no position
and arrives as `unknown`.

`oxfmt` moved to 0.68.0 to match. The gate that formats examples and the gate that checks the tree
have to be the same formatter, or they eventually disagree about a file neither of them is wrong
about.

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
