# 0028 — This repository names no employer

- **Status**: accepted
- **Scope**: the repository

## Context

The problems these libraries solve were recognised at work: a bootstrap sequence that nobody could
see the shape of, dialogs that answered for each other, a design system with two sources of truth.
Recognising a problem at work is how most library authors find one.

What must not travel with it is anything belonging to the employer — the organisation, the product,
the customers, or the vocabulary of the industry it operates in. Industry nouns are the part that
leaks, because they arrive as example data and read like neutral placeholders rather than like a
disclosure.

## Decision

**Nothing here names or describes an employer, a product, a customer, or the industry any of them
are in.** Not in code, not in an example, not in a fixture, not in a comment, not in a commit
message — and not in this file, which is why no sector is named anywhere in this repository.

Example data uses nouns that mean what the example needs and nothing more: a _workspace_, a
_project_, a _tag_.

The work is done on personal time, on personal hardware, under a personal name and address. The git
history carries no other identity.

## Consequences

**This was enforced once retroactively, and the history was rewritten rather than only the working
tree**, because a name in an old commit is still a name in the repository. That is why the rule is
written as an absolute: the cost of catching it late is measured in rewritten history, not in an
edit.

**The generic replacements turned out to be the better names anyway.** _Workspace_, _project_ and
_tag_ describe what the playground's data actually is — a set, a member, a label — where the
originals described what it once stood for. The constraint asked for a clarity the examples did not
have, which is the usual shape of a good constraint.

**The test is not "would a reader recognise this", it is "does this noun come from somewhere other
than the example".** A vocabulary that a reader would have to be an insider to place is exactly the
kind that survives review, so the rule is applied to the noun's origin rather than to how obvious it
looks.

Nothing here is published ([0001](0001-nothing-here-is-published.md)) and none of this code was
written for an employer, so this decision costs nobody anything they are owed. It is written down so
that it outlives the person who remembers why it was necessary.
