# What is shared, what is not, and why

The point of this repository is to combine and normalise everything that is genuinely shared. That
only means something if the other half is written down too — so this is the register: what has been
unified and what holds it there, what is deliberately still different, and what is simply not done
yet.

**A line moves out of the third table by being fixed or by being argued into the second one.** The
danger is a divergence that is neither — one nobody decided on and nobody is tracking, which is what
every entry in the first table used to be.

Last measured 2026-09-17.

## Unified, and what holds it

A rule without a gate is a preference, so each row names the thing that fails when the row stops
being true.

| What                      | Where it lives now                       | What holds it                                           |
| ------------------------- | ---------------------------------------- | ------------------------------------------------------- |
| Lint rules                | `.oxlintrc.json`, each workspace extends | `yarn lint` at the root, over every file                |
| Formatting                | `.oxfmtrc.json`, one for the tree        | `yarn format:check` at the root, over every file        |
| TypeScript strictness     | `tsconfig.base.json`, each extends       | each workspace's `type-check`                           |
| Script bodies             | each manifest, checked against the rest  | `yarn constraints` — one name, one command              |
| Dependency versions       | one range per ident                      | `yarn constraints` — one version per dependency         |
| A workspace being seen    | every workspace has `check` and `test`   | `yarn constraints` — an explicit no-op counts           |
| The hoisting boundary     | `installConfig.hoistingLimits`           | `yarn constraints`, asymmetric and commented            |
| Design tokens             | `penumbra`                               | `check-tokens.mjs`, both halves, both directions        |
| Colour contrast           | `penumbra`                               | `penumbra-contrast`, 32 pairs × both schemes            |
| The token tables          | `corona`                                 | `check-token-coverage.mjs` — every token is on a page   |
| The API reference viewer  | `corona`                                 | the two playgrounds' smoke suites                       |
| The way back to the site  | `corona`                                 | `yarn check:mobile`                                     |
| Framework-free helpers    | `limb`                                   | its entry rule: if it needs a framework, it is not limb |
| The gates themselves      | `gnomon`                                 | `yarn check` in each consumer                           |
| Agent-instruction budgets | `gnomon-doc-budget`                      | `yarn doc-budget`, a ceiling and a headroom line each   |
| Phone layout              | —                                        | `yarn check:mobile`, 16 routes × 2 widths               |

**Devtools are one decision, not seven.** Every workspace runs oxlint with its type-aware half on
tsgolint, oxfmt, and TypeScript 7 — the same versions, enforced by the dependency constraint. There
is no eslint and no prettier anywhere in the tree, and no workspace is on an older compiler than the
linter that judges it.

## Different on purpose

Each of these was looked at and kept apart. The reason is the value of the row: without it the next
reader has to rediscover it, and the cheapest way to look thorough is to unify something that should
not be.

**`SurfaceCard`.** A slot the playgrounds fill rather than a component `corona` owns. One is a
hairline and a radius; the other lifts on hover behind a corona. Sharing them would mean one of the
two products losing its own surface.

**The two API generators.** `vite-plugins/api-model.ts` exists twice and the copies share about half
their lines — different entry points, different categories, different symbol handling. That is a
real difference between two products. What they do agree on is the _shape they emit_, and that
agreement is `corona`'s `contract.ts`.

**The palettes.** Each project's `tokens.skin.css` is eleven or twelve declarations — three faces and
the brand. Colour is the half a project rewrites; the neutral half underneath it is
`penumbra/tokens.skin.base.css` and is shared. The seam is where the token files already put it.

**Twelve script names**, each with its reason in `yarn.config.cjs`. `check`, `test` and `verify:all`
are every workspace's own gate; `type-check` runs two programs in a library and one in an app;
`test:component` differs because antumbra has touch and focus projects umbra has not.

**`lib` and `types` in each `tsconfig.json`.** `DOM.Iterable` where a `NodeList` is walked,
`vite/client` in the app that needs it. Adding either everywhere would claim a capability a package
does not use.

**`no-restricted-imports`** lives in the two workspaces that depend on MUI. A restriction on an
import the other three cannot resolve is a rule that cannot fail.

**`ignorePatterns`, written out five times.** oxlint does not inherit it through `extends` — not even
into a child that declares none, which was measured against 1.83.0. That duplication is the tool's
and not a choice; the comment in each file says so.

## Not done

**`createStore` and `normalizeError` are one name over two different things.** The backlog carried
this as "should they move to `limb`?" Measured, the answer is no: umbra's `createStore` is 56 lines
and antumbra's is 198, with 212 of 254 lines differing, and `normalizeError` is 45 lines against 15.
They are not two copies that drifted — they are two designs that collided on a name. So the work is
not an extraction; it is deciding whether one of them should be called something else, and that is a
change to antumbra's published surface — its README, its `CHANGELOG`, the positive halves of its
entry-isolation test. Worth doing, and worth doing on its own.

**The showcase shell.** The last page-shaped duplication between the two playgrounds that has not
been measured properly. Unlike the design-system page, it was never inventoried, so "how much of it
is the same" is currently an impression rather than a number.

**`verbatimModuleSyntax` is on in `apps/home` and nowhere else.** The lint rule
`typescript/consistent-type-imports` asks for the same shape everywhere, so nothing is actually
unchecked — but one workspace is held to it by the compiler and four by the linter, and that is a
difference nobody decided on. Turning it on in the libraries is untested.

**`--app-z-sidebar` and `--app-z-mascot` are both `30`.** Which paints over which is source order
rather than a decision. Visible on both design-system pages since the layout section was added, and
left as it is.

**The og-image is French-only**, on a site whose default language is English.

**Two stale directories sit beside this repository** — `dialogManager/` and `antumbra/` in
`D:\workspace\francisdesjardins\2025\` — holding the pre-monorepo copies of code that now lives in
`packages/`. Deleting someone's working directories is not this repository's call, so they are
recorded here instead.

**The GitHub repository does not exist yet.** `origin` is set to
`github.com/francisdesjardins/syzygy` and answers "Repository not found", so nothing has been pushed.
That is why the site's JSON-LD omits `codeRepository`: a link to a 404 is worse than a missing field.
