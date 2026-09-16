import { expect, test } from '@playwright/test';
import { createBootstrap } from '../create-bootstrap.js';
import { defineStep } from '../define-step.js';
import { readStepData } from '../read-data.js';

/**
 * The untyped boundary the three bindings share, tested once here rather than three times over.
 *
 * It is the only way to read a step's data off an outcome whose step list is no longer in the type,
 * so its two answers — the value, and `undefined` — are what every binding's `useStepData` returns.
 */

test('reading from no outcome at all answers undefined', () => {
  expect(readStepData(undefined, 'session')).toBeUndefined();
});

test('reading a step that is not in the outcome answers undefined', async () => {
  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'session',
        run: () => {
          return { userId: 'u1' };
        },
      }),
    ],
  });
  const outcome = await boot.run();

  expect(readStepData(outcome, 'nothing-declared-this')).toBeUndefined();
});

test('reading a settled step answers the value it returned', async () => {
  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'session',
        run: () => {
          return { userId: 'u1' };
        },
      }),
    ],
  });
  const outcome = await boot.run();

  expect(readStepData(outcome, 'session')).toEqual({ userId: 'u1' });
});
