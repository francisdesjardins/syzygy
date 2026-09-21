# 0009 — The playgrounds are dogfood, the site is the showcase

- **Status**: accepted
- **Scope**: the repository

## Context

Each library ships a playground: a real application that boots it, exercises it and documents it.
They are the largest and most visible code here, so they are easy to mistake for the product.

The site made that mistake structurally. It listed three works and hosted one of them —
`penumbra`'s only shopfront was `/design-system`, a page _of_ the site, which made a stylesheet
read as a peer of two libraries rather than as the thing both are built on.

## Decision

The libraries are the work. The playgrounds are how the libraries are used, tested and shown.

`penumbra` has a playground of its own at `/playground/design`, and the site links to three
playgrounds rather than hosting one of them.

## Consequences

**A worked example cited as evidence comes from `src/`, not from `playground/`.** Playground code
is allowed conveniences a library is not, and quoting it as proof of how the library is built is
quoting the wrong file.

The split still earns its keep for two reasons that are not marketing: a playground is where the
component tests mount, and it is the only place that proves an entry point resolves the way a
consumer would resolve it.

Each playground keeps what is genuinely its own — its six colour declarations and its own controls,
under `/skin`. What moved into `corona` instead is [0011](0011-what-is-deliberately-different.md).
