# 0024 — No upstream "module ready" channel

- **Status**: accepted, having been asked for and studied
- **Scope**: umbra

## Context

A micro-frontend host wants to know when a fragment has finished booting. The obvious shape is a
channel pointing upward: a module announces itself, the orchestrator collects the announcements, and
anyone can ask who is ready.

It was asked for, and it was worked through rather than dismissed.

## Decision

Refused. There is no upstream readiness channel, and a run reports on its own steps only.

Three reasons, and the third is the one that decides it:

**Unbounded growth.** A page's set of modules is open-ended, and a registry of who has announced
themselves has no point at which it is complete or at which an entry may be dropped.

**Nowhere to put the types.** The value a module would announce belongs to that module, and the
collector belongs to this package. There is no declaration site where both are in scope, so the
channel would be typed as something close to `unknown` — which is the shape that makes a feature
technically present and practically unusable.

**The host already does it better.** `single-spa:app-change` and `getMountedApps()` answer exactly
this question, for every module on the page, whether or not it uses this library.

## Consequences

**A library that reimplements its host's signals creates two sources of truth to keep in step**, and
the one it owns is always the poorer of the two — it sees only its own users.

An application that needs cross-module readiness asks the host. An application with no host does not
have the problem, because a single run already reports its own steps.

What this package _does_ carry upward is different in kind and deliberately narrow: **intents** —
work the framework-free layer cannot do itself, such as a dialog to open or a redirect to propose —
handed to the layer that mounts. That is a queue with a closed set of authors, which is why it
survives the objections above.
