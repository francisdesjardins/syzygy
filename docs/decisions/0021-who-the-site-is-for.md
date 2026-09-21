# 0021 — Who the site is for

- **Status**: accepted
- **Scope**: apps/home

## Context

The site is one page and it is the only thing most visitors will ever see. Written without a reader
in mind it becomes either a CV in prose or a list of technologies, and both read as someone asking
to be hired rather than someone showing what they think.

The reader is a developer or a recruiter who landed cold, knows none of this, and will decide in
about thirty seconds whether there is anything here.

## Decision

The page makes an argument, not a claim. The argument is the one the libraries embody: **a
dependency is easy to add and hard to remove, and most of what one does goes unused.**

No job titles. Nothing that has to be taken on trust. The first two sentences are readable by
someone who has never heard of any of this.

## Consequences

**The evidence is the cores, never the playgrounds** — see
[0009](0009-the-playgrounds-are-dogfood.md). Pointing at the dogfood layer as proof of the position
would be pointing at the wrong code.

The argument cuts both ways or it is not an argument. Some problems _are_ the other way round —
time zones, cryptography, anything whose hard part is the one you have not met yet — and the page
says so. A library earns its place the day the requirements outgrow what you wrote.

**Every link lands on the page that answers the question**, not on a playground's home. A reader
who has decided to look has already been sold; making them navigate is asking them to decide twice.

**Both languages are measured, every time.** The page has one screen to spend, and the French text
is longer — it has overflowed at 1366 and 1280 while the English fitted. Measuring one and
reporting both is how that shipped once.
