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
no number. Quote coverage where a command prints it; if a document must carry one, it carries the
date it was measured and is read as a snapshot.
