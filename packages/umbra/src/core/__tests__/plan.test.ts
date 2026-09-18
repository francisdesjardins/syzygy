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

test('a preflight step cannot depend on a hosted one', () => {
  const hosted = defineHostedStep({
    id: 'warn',
    run: () => {
      return undefined;
    },
  });
  expect(() => {
    return createBootstrap({ steps: [hosted, inert('a', ['warn'])] });
  }).toThrow(/never be satisfied/);
});

test('hosted levels are numbered after the preflight ones', () => {
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

test('nodes carry the edges the levels cannot express', () => {
  const boot = createBootstrap({
    steps: [
      inert('session'),
      inert('device'),
      inert('access', ['session']),
      inert('config', ['session', 'device']),
    ],
  });

  const nodes = boot.plan().nodes;
  const nodeOf = (id: string) => {
    return nodes.find((node) => {
      return node.id === id;
    });
  };

  // `access` and `config` share a level, and only the edges say the two are there for different
  // reasons. A level alone cannot be drawn as a graph.
  expect(nodeOf('access')?.level).toBe(nodeOf('config')?.level);
  expect(nodeOf('access')?.needs).toEqual(['session']);
  expect(nodeOf('config')?.needs).toEqual(['session', 'device']);
});

test('dependents are the same edge read backwards', () => {
  const boot = createBootstrap({
    steps: [inert('session'), inert('access', ['session']), inert('config', ['session'])],
  });

  const session = boot.plan().nodes.find((node) => {
    return node.id === 'session';
  });

  expect(session?.dependents).toEqual(['access', 'config']);
  expect(session?.needs).toEqual([]);
});

test('nodes are in the order the levels list their ids', () => {
  const boot = createBootstrap({
    steps: [
      inert('session'),
      inert('device'),
      inert('access', ['session']),
      defineHostedStep({ id: 'banner', needs: ['access'], run: () => {} }),
    ],
  });

  const plan = boot.plan();

  expect(
    plan.nodes.map((node) => {
      return node.id;
    })
  ).toEqual(
    plan.levels.flatMap((level) => {
      return [...level.ids];
    })
  );
});

test('a node reports its scope and phase, and never the step itself', () => {
  const boot = createBootstrap({
    steps: [
      defineStep({ id: 'session', scope: 'shared', run: () => {} }),
      defineHostedStep({ id: 'banner', needs: ['session'], optional: true, run: () => {} }),
    ],
  });

  const [session, banner] = boot.plan().nodes;

  expect(session).toEqual({
    id: 'session',
    phase: 'preflight',
    level: 0,
    needs: [],
    dependents: ['banner'],
    scope: 'shared',
    optional: false,
  });
  expect(banner?.phase).toBe('hosted');
  expect(banner?.optional).toBe(true);
});
