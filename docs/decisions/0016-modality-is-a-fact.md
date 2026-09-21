# 0016 — Modality is a fact, priority is a policy

- **Status**: accepted
- **Scope**: antumbra

## Context

Stacking order looks like one problem with one answer: give every dialog a number and sort.

It is not. `showModal()` places a dialog in the browser's **top layer**, which paints above
ordinary content, and **no `z-index` reaches between them**.

## Decision

The stack order is three keys, and only the middle one is a policy: **modality**, then
`dialogManager.prioritize`, then **open order**.

Modality is a fact the policy cannot touch. A big number on a non-modal panel ranks it against the
other panels and moves it no nearer the user.

## Consequences

Order decides who answers the dismiss key, which is why `isForeground` matters beyond paint.
Reordering a modal dialog has a cost, documented on `raiseDialog`.

**The top-layer rule follows from this**: the native backdrop blocks clicks outside the `<dialog>`,
so any button clickable while a dialog is open must be inside the `render` callback. Multi-dialog
means opening the second from inside the first dialog's render. This applies to stories, tests and
playground examples alike.

**Non-modal dialogs never enter the top layer**, so their positioning depends on placement.
Portaled, they anchor to the viewport. Not portaled, they are _contained_: rendered inside a
library-owned wrapper laid over the nearest sized, positioned ancestor, and positioned absolutely
against that wrapper. Absolute rather than in-flow because it must be immune to a transformed
ancestor hijacking the containing block — the jump a fixed inline dialog hits. It fills its nearest
**sized** ancestor, so without a sized, positioned host the panel collapses.

**A dialog only answers for its own subtree.** A dialog opened from inside another renders its
`<dialog>` in that one's tree, so every event bubbles through the dialog underneath.
`utils/dialog-scope.ts` scopes keydown handling and hotkey dispatch — without it, one Escape
unwinds the whole stack.
