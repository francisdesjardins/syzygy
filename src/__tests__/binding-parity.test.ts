import { expect, test } from '@playwright/test';
import * as core from '../index.js';
import * as react from '../react.js';
import * as solid from '../solid.js';
import * as vanilla from '../vanilla.js';

/**
 * The names a hook binding owns. A team running both writes the same bootstrap twice with the same
 * words, and this is what keeps that true: adding a hook to one binding and not the other fails
 * here rather than in somebody's code review six months later.
 */
const HOOK_BINDING_SURFACE = [
  'BootstrapProvider',
  'useBootstrap',
  'useBootstrapContext',
  'useIntentHost',
  'useStepData',
];

function ownNames(binding: Record<string, unknown>): string[] {
  const shared = new Set(Object.keys(core));
  return Object.keys(binding)
    .filter((name) => {
      return !shared.has(name);
    })
    .sort();
}

test('every binding re-exports the root wholesale', () => {
  for (const [name, binding] of Object.entries({ react, solid, vanilla })) {
    const missing = Object.keys(core).filter((exported) => {
      return !(exported in binding);
    });
    expect(missing, `antumbra/${name} does not re-export the root`).toEqual([]);
  }
});

test('the two hook bindings have the same surface', () => {
  expect(ownNames(react)).toEqual(HOOK_BINDING_SURFACE);
  // Solid adds exactly one name, and it is the store-to-signal bridge React does not need because
  // it has `useSyncExternalStore` for the same shape.
  expect(ownNames(solid)).toEqual([...HOOK_BINDING_SURFACE, 'fromStore'].sort());
});

test('the controller binding is a different kind, and adds one function', () => {
  // Not a hook binding: it does not render, so it has no provider and no hooks. Asserting its own
  // shape rather than exempting it is what keeps a hook from being added here by accident.
  expect(ownNames(vanilla)).toEqual(['bindBootstrap']);
});
