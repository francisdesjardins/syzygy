import { expect, test } from '@playwright/test';
import { createBootstrap } from '../create-bootstrap.js';
import { defineHostedStep, defineStep } from '../define-step.js';
import { PlanError } from '../errors.js';
import type { AnyStep } from '../types.js';

/** A step that records nothing and is never expected to run in this file. */
function inert(id: string, needs?: readonly string[]): AnyStep {
  return defineStep({
    id,
    ...(needs === undefined ? {} : { needs }),
    run: () => {
      throw new Error(`plan() must not run "${id}".`);
    },
  });
}

test('levels put independent steps together and dependents after', () => {
  const boot = createBootstrap({
    steps: [
      inert('session'),
      inert('device'),
      inert('access', ['session']),
      inert('config', ['session', 'device']),
      inert('lists', ['config']),
    ],
  });

  expect(
    boot.plan().levels.map((level) => {
      return [...level.ids].sort();
    })
  ).toEqual([['device', 'session'], ['access', 'config'], ['lists']]);
});

test('plan runs nothing', () => {
  const boot = createBootstrap({ steps: [inert('a'), inert('b', ['a'])] });
  expect(() => {
    return boot.plan();
  }).not.toThrow();
});

test('a cycle is rejected at construction, naming its members', () => {
  expect(() => {
    return createBootstrap({ steps: [inert('a', ['b']), inert('b', ['a'])] });
  }).toThrow(PlanError);

  let message = '';
  try {
    createBootstrap({ steps: [inert('a', ['b']), inert('b', ['a'])] });
  } catch (error: unknown) {
    message = error instanceof Error ? error.message : '';
  }
  expect(message).toContain('a');
  expect(message).toContain('b');
});

test('an edge to a step nobody declares is rejected at construction', () => {
  expect(() => {
    return createBootstrap({ steps: [inert('a', ['ghost'])] });
  }).toThrow(/needs "ghost"/);
});

test('a duplicate id is rejected at construction', () => {
  expect(() => {
    return createBootstrap({ steps: [inert('a'), inert('a')] });
  }).toThrow(/Duplicate step id "a"/);
});

test('a preflight step cannot depend on a mounted one', () => {
  const mounted = defineHostedStep({
    id: 'warn',
    run: () => {
      return undefined;
    },
  });
  expect(() => {
    return createBootstrap({ steps: [mounted, inert('a', ['warn'])] });
  }).toThrow(/never be satisfied/);
});

test('mounted levels are numbered after the preflight ones', () => {
  const boot = createBootstrap({
    steps: [
      inert('session'),
      defineHostedStep({
        id: 'warn',
        needs: ['session'],
        run: () => {
          return undefined;
        },
      }),
    ],
  });

  expect(
    boot.plan().levels.map((level) => {
      return { level: level.level, phase: level.phase, ids: level.ids };
    })
  ).toEqual([
    { level: 0, phase: 'preflight', ids: ['session'] },
    { level: 1, phase: 'hosted', ids: ['warn'] },
  ]);
});
