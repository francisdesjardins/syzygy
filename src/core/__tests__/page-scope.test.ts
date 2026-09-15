import { expect, test } from '@playwright/test';
import { createBootstrap } from '../create-bootstrap.js';
import { defineStep } from '../define-step.js';
import { clearPageScope } from '../page-scope.js';
import type { AnyStep, StepTrace } from '../types.js';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function traceOf(timeline: readonly StepTrace[], id: string): StepTrace | undefined {
  return timeline.find((trace) => {
    return trace.id === id;
  });
}

/**
 * Two modules on one page, each with its own bootstrap.
 *
 * The shape the whole feature is for: a monorepo where two modules boot independently, or two
 * micro-frontends that were built separately and have no way to talk to each other.
 */
function twoModules(steps: () => readonly AnyStep[]) {
  return [createBootstrap({ steps: steps() }), createBootstrap({ steps: steps() })] as const;
}

test.beforeEach(() => {
  clearPageScope();
});

test('a page-scoped step runs once for the whole page', async () => {
  let calls = 0;
  const steps = () => {
    return [
      defineStep({
        id: 'session',
        scope: 'page',
        run: async () => {
          calls += 1;
          await sleep(10);
          return { userId: 'u-1' };
        },
      }),
    ];
  };

  const [first, second] = twoModules(steps);
  const [a, b] = await Promise.all([first.run(), second.run()]);

  expect(calls).toBe(1);
  expect(a.status).toBe('ready');
  expect(b.status).toBe('ready');
  expect(a.data['session']).toEqual({ userId: 'u-1' });
  // The sharer has the value without having done the work, and its timeline says so.
  expect(b.data['session']).toEqual({ userId: 'u-1' });
  expect(traceOf(b.timeline, 'session')?.shared).toBe(true);
  expect(traceOf(a.timeline, 'session')?.shared).toBeUndefined();
});

test('an app-scoped step still runs per bootstrap', async () => {
  let calls = 0;
  const steps = () => {
    return [
      defineStep({
        id: 'per-app',
        run: () => {
          calls += 1;
          return calls;
        },
      }),
    ];
  };

  const [first, second] = twoModules(steps);
  await Promise.all([first.run(), second.run()]);

  expect(calls).toBe(2);
});

test('a module arriving late adopts a result that is already settled', async () => {
  let calls = 0;
  const steps = () => {
    return [
      defineStep({
        id: 'config',
        scope: 'page',
        run: () => {
          calls += 1;
          return { workspaceName: 'Shared' };
        },
      }),
    ];
  };

  const [first] = twoModules(steps);
  await first.run();

  // The second module was code-split and only loaded now, which is the ordinary micro-frontend case.
  const late = createBootstrap({ steps: steps() });
  const outcome = await late.run();

  expect(calls).toBe(1);
  expect(outcome.data['config']).toEqual({ workspaceName: 'Shared' });
  expect(traceOf(outcome.timeline, 'config')?.shared).toBe(true);
});

test('a refusal blocks every module, not only the one that looked', async () => {
  const steps = () => {
    return [
      defineStep({
        id: 'session',
        scope: 'page',
        run: (ctx) => {
          return ctx.block('No session.');
        },
      }),
    ];
  };

  const [first, second] = twoModules(steps);
  const [a, b] = await Promise.all([first.run(), second.run()]);

  expect(a.status).toBe('blocked');
  expect(b.status).toBe('blocked');
  expect(
    b.status === 'ready' ? undefined : b.status === 'blocked' ? b.blockedBy?.reason : undefined
  ).toBe('No session.');
});

test('a failure is adopted too, so a sharer does not mount on data nobody has', async () => {
  const steps = () => {
    return [
      defineStep({
        id: 'session',
        scope: 'page',
        run: () => {
          throw new Error('401');
        },
      }),
    ];
  };

  const [first, second] = twoModules(steps);
  const [a, b] = await Promise.all([first.run(), second.run()]);

  expect(a.status).toBe('failed');
  expect(b.status).toBe('failed');
  expect(b.errors[0]?.error.message).toBe('401');
});

test('the notices and intents of a shared step belong to the run that did the work', async () => {
  const steps = () => {
    return [
      defineStep({
        id: 'config',
        scope: 'page',
        run: (ctx) => {
          ctx.notice('config:from-cache', { ageSeconds: 1 });
          ctx.intent('warn:trial-expiring', { daysLeft: 5 });
          return { workspaceName: 'Shared' };
        },
      }),
    ];
  };

  const [first, second] = twoModules(steps);
  const [a, b] = await Promise.all([first.run(), second.run()]);

  // One warning on the page, not one per module — which is the point. The sharer still has the
  // data it needed.
  expect(a.intents).toHaveLength(1);
  expect(b.intents).toHaveLength(0);
  expect(a.notices).toHaveLength(1);
  expect(b.notices).toHaveLength(0);
  expect(b.data['config']).toEqual({ workspaceName: 'Shared' });
});

test('dependents of a shared step read it exactly like any other dependency', async () => {
  const steps = () => {
    return [
      defineStep({
        id: 'session',
        scope: 'page',
        run: () => {
          return { userId: 'u-1' };
        },
      }),
      defineStep({
        id: 'access',
        needs: ['session'],
        run: (ctx) => {
          // The registry is not augmented in the library's own program, so a dependency reads back
          // as `unknown` here. What this proves is the wiring, not the typing: the fixtures in
          // `type-fixtures/` own that half.
          const session: unknown = ctx.get('session');
          return { readFrom: session };
        },
      }),
    ];
  };

  const [first, second] = twoModules(steps);
  const [, b] = await Promise.all([first.run(), second.run()]);

  expect(b.status).toBe('ready');
  expect(b.data['access']).toEqual({ readFrom: { userId: 'u-1' } });
});

test('clearing the page scope makes the next module do the work again', async () => {
  let calls = 0;
  const steps = () => {
    return [
      defineStep({
        id: 'session',
        scope: 'page',
        run: () => {
          calls += 1;
          return { userId: 'u-1' };
        },
      }),
    ];
  };

  await createBootstrap({ steps: steps() }).run();
  clearPageScope();
  await createBootstrap({ steps: steps() }).run();

  expect(calls).toBe(2);
});
