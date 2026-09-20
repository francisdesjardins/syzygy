import { expect, test } from '@playwright/test';
import { createBootstrap } from '../create-bootstrap.js';
import { defineStep } from '../define-step.js';
import { clearSharedScope } from '../shared-scope.js';
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
  clearSharedScope();
});

test('a shared step runs once for everyone that declared it', async () => {
  let calls = 0;
  const steps = () => {
    return [
      defineStep({
        id: 'session',
        scope: 'shared',
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
        scope: 'shared',
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
        scope: 'shared',
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
        scope: 'shared',
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

test('the sharer is handed the whole cause chain, not just the outermost message', async () => {
  const steps = () => {
    return [
      defineStep({
        id: 'session',
        scope: 'shared',
        run: () => {
          throw new Error('401', { cause: new Error('token endpoint refused') });
        },
      }),
    ];
  };

  const [first, second] = twoModules(steps);
  const [, b] = await Promise.all([first.run(), second.run()]);

  // The sharer never ran the step, so it debugs from what it was handed. Dropping the cause here
  // left it reading '401' with nothing under it, while the owner had the reason.
  expect(b.errors[0]?.error.cause?.message).toBe('token endpoint refused');
});

test('the notices and intents of a shared step belong to the run that did the work', async () => {
  const steps = () => {
    return [
      defineStep({
        id: 'config',
        scope: 'shared',
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
        scope: 'shared',
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

test('clearing the shared scope makes the next module do the work again', async () => {
  let calls = 0;
  const steps = () => {
    return [
      defineStep({
        id: 'session',
        scope: 'shared',
        run: () => {
          calls += 1;
          return { userId: 'u-1' };
        },
      }),
    ];
  };

  await createBootstrap({ steps: steps() }).run();
  clearSharedScope();
  await createBootstrap({ steps: steps() }).run();

  expect(calls).toBe(2);
});

test('a shared step that does not apply does not apply for its sharers either', async () => {
  const steps = () => {
    return [
      defineStep({
        id: 'session',
        scope: 'shared',
        run: (ctx) => {
          return ctx.skip('no plugin host on this install');
        },
      }),
      defineStep({
        id: 'reads-it',
        needs: ['session'],
        run: () => {
          return { any: true };
        },
      }),
    ];
  };

  const [first, second] = twoModules(steps);
  const [a, b] = await Promise.all([first.run(), second.run()]);

  // The sharer adopts the ending, as it does for a value and for a refusal. Read as a failure it
  // would have thrown a rebuilt error into a module that did nothing wrong.
  for (const outcome of [a, b]) {
    expect(outcome.status).toBe('ready');
    expect(outcome.errors).toEqual([]);
    expect(
      outcome.timeline.find((trace) => {
        return trace.id === 'session';
      })?.status
    ).toBe('skipped');
    expect(outcome.data['reads-it']).toBeUndefined();
  }
});

test("a shared step's timeout is everyone's timeout, not just the owner's", async () => {
  // The owner's budget is the tight one. The sharer's is long enough that reaching `timed-out`
  // on its own would take forty times as long — so the word it ends with can only have been
  // adopted, which is the difference between this and two clocks agreeing by accident.
  const steps = (timeout: number) => {
    return () => {
      return [
        defineStep({
          id: 'session',
          scope: 'shared',
          timeout,
          run: () => {
            // Ignores its signal on purpose: an ending decided entirely by the abort is the one
            // the owner's body never sees, and the one a sharer would otherwise wait forever for.
            return new Promise<never>(() => {});
          },
        }),
      ];
    };
  };

  const owner = createBootstrap({ steps: steps(120)() });
  const sharer = createBootstrap({ steps: steps(5000)() });

  const started = Date.now();
  const [first, second] = await Promise.all([owner.run(), sharer.run()]);
  const elapsed = Date.now() - started;

  expect(traceOf(first.timeline, 'session')?.status).toBe('timed-out');
  expect(traceOf(second.timeline, 'session')?.status).toBe('timed-out');
  expect(traceOf(second.timeline, 'session')?.shared).toBe(true);
  expect(elapsed).toBeLessThan(1500);

  // A timeout is a failure, so both report one — the point is that they report the same one.
  const statuses = (failures: readonly { status: string }[]) => {
    return failures.map((failure) => {
      return failure.status;
    });
  };
  expect(statuses(first.errors)).toEqual(['timed-out']);
  expect(statuses(second.errors)).toEqual(['timed-out']);
});

test('a sharer waiting on a step whose owner was stopped is told, rather than left waiting', async () => {
  // The owner refuses the mount in one step and shares another on the same level. The refusal
  // aborts the level, so the shared step is `cancelled` — an ending its own body never sees, and
  // one nobody would ever publish if the owner only settled from inside `run`.
  const owner = createBootstrap({
    steps: [
      defineStep({
        id: 'guard',
        run: (ctx) => {
          return ctx.block('No session.');
        },
      }),
      defineStep({
        id: 'directory',
        scope: 'shared',
        run: async () => {
          await sleep(200);
          return { entries: 3 };
        },
      }),
    ],
  });

  const sharer = createBootstrap({
    steps: [
      defineStep({
        id: 'directory',
        scope: 'shared',
        timeout: 4000,
        run: async () => {
          await sleep(200);
          return { entries: 3 };
        },
      }),
    ],
  });

  const started = Date.now();
  const [refused, second] = await Promise.all([owner.run(), sharer.run()]);

  expect(refused.status).toBe('blocked');
  expect(traceOf(second.timeline, 'directory')?.status).toBe('cancelled');
  // Not a failure: nothing was learned, so there is nothing to fix.
  expect(second.errors).toEqual([]);
  expect(Date.now() - started).toBeLessThan(1500);
});
