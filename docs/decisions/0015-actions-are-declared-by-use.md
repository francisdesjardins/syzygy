# 0015 — Actions are declared by use

- **Status**: accepted
- **Scope**: antumbra

## Context

The conventional shape is to configure a dialog's buttons where the dialog is opened: an array of
actions passed into the hook, each with a label, a handler and a reason.

That splits one thing across two places. The button lives in `render`; its declaration lives in the
call above it, and the two drift.

## Decision

`action('confirm', handler)` **inside `render`** names the action and closes with
`reason: 'confirm'`. There is no config and nothing to pass into `useDialog`.

## Consequences

The reasons a dialog can close with are still worth typing, and there are two ways: a type argument
on `useDialog`, or once in `DialogRegistry` — `closesWith` naming the reasons, or giving each
reason its own payload, which is then **required** where declared.

**The default reason type accepts any string**, silently costing the typo-safety and the exhaustive
`switch` in `onClose` that are the point of the design. That default is a convenience for a first
five minutes, not the intended end state.

A custom button wrapper **must forward three props** — `aria-keyshortcuts`, `data-focus-on-open`
and `data-action-reason` — because all three are queried out of the DOM. Dropping one makes that
feature silently do nothing, which is the failure mode this design buys in exchange for having no
config.

Hotkeys ride the same declaration: an action carries its own `hotkey`. There is no standalone
`useHotkey`.
