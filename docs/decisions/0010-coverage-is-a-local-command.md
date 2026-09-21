# 0010 — Coverage is a local command, not a CI job

- **Status**: accepted
- **Scope**: antumbra, umbra

## Context

Two coverage reports exist, because one project cannot reach the whole library: a unit run in Node
with no DOM, and a component run in the browsers.

The obvious next step is to publish them from CI on every push.

## Decision

Coverage is run locally, on purpose, and is not a CI job.

GitHub's upload is Cobertura-only and 404s on a personal repository, and publishing an artifact
nobody opens costs the component job about 45% more runtime. The component report is opt-in
(`CT_COVERAGE=1`) for the same reason — instrumentation costs roughly 45% of the run.

## Consequences

Do not re-add the upload unless the repository moves under an enterprise **and** something renders
the result.

The exclude lists are statements of reach, not of convenience: the unit report excludes type-only
modules, every binding (globbed, since a new file there is component-test territory) and the
DOM-only core modules — those **listed one by one**, so a new module shows up as a gap until
somebody decides which kind it is.

The component report measures **every browser project**, not just Chromium: one engine was the
founding experiment's scope rather than a decision, and it made the number lie in a specific
direction — a line only WebKit reaches was perfectly tested and counted as missed.

**The cost of this decision is a number in a document that nothing recomputes.** A measured
percentage quoted in prose is stale the day after it is written, and a stale number is worse than
no number.

So there is exactly one copy. `README.md` carries the pair and its badges, written only by
`yarn coverage:update`, whose patterns fail loudly if the prose around them is reworded. **No
`CLAUDE.md` quotes a coverage number**: that file loads into every session, so a measurement there
is paid for on every task and goes stale where nobody is looking.

`check:coverage-config` holds the one key that would make a report lie — `all: true`, without which
a module no test imports is absent rather than 0% — and it finds the configs by walking the
workspaces, per [0006](0006-gates-measure-the-artifact.md), rather than from a list that the fifth
package would be left off.
