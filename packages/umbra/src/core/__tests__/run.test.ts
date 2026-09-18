import { expect, test } from '@playwright/test';
import { createBootstrap } from '../create-bootstrap.js';
import { defineStep } from '../define-step.js';
import type { AnyStep } from '../types.js';

function deferred(): { promise: Promise<void>; resolve: () => void } {
  let resolve = (): void => {
    return undefined;
  };
  const promise = new Promise<void>((settle) => {
    resolve = () => {
      settle();
    };
  });
  return { promise, resolve };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

test('steps on one level are in flight at the same time', async () => {
  const gate = deferred();
  let bothEntered = false;
  let entered = 0;

  const enter = async (): Promise<string> => {
    entered += 1;
    if (entered === 2) {
      bothEntered = true;
      gate.resolve();
    }
    await gate.promise;
    return 'done';
  };

  const boot = createBootstrap({
    steps: [defineStep({ id: 'left', run: enter }), defineStep({ id: 'right', run: enter })],
  });

  const outcome = await boot.run();
  expect(bothEntered).toBe(true);
  expect(outcome.status).toBe('ready');
});

test('a dependent never starts before its dependency settles', async () => {
  const order: string[] = [];
  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'session',
        run: async () => {
          await sleep(20);
          order.push('session');
          return { userId: 'u1' };
        },
      }),
      defineStep({
        id: 'config',
        needs: ['session'],
        run: (ctx) => {
          order.push('config');
          return ctx.get('session');
        },
      }),
    ],
  });

  const outcome = await boot.run();
  expect(order).toEqual(['session', 'config']);
  expect(outcome.status).toBe('ready');
  expect(outcome.data['config']).toEqual({ userId: 'u1' });
});

test('a required failure fails the run and skips its dependents', async () => {
  const ran: string[] = [];
  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'session',
        run: () => {
          ran.push('session');
          throw new Error('401');
        },
      }),
      defineStep({
        id: 'config',
        needs: ['session'],
        run: () => {
          ran.push('config');
          return 1;
        },
      }),
    ],
  });

  const outcome = await boot.run();
  expect(outcome.status).toBe('failed');
  expect(ran).toEqual(['session']);
  expect(
    outcome.timeline.find((trace) => {
      return trace.id === 'config';
    })?.status
  ).toBe('skipped');
  expect(outcome.errors[0]?.error.message).toBe('401');
  expect(outcome.errors[0]?.tolerated).toBe(false);
});

test('an optional failure degrades the run and prunes only its own subtree', async () => {
  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'session',
        run: () => {
          return { userId: 'u1' };
        },
      }),
      defineStep({
        id: 'config',
        needs: ['session'],
        optional: true,
        run: () => {
          throw new Error('503');
        },
      }),
      defineStep({
        id: 'lists',
        needs: ['config'],
        optional: true,
        run: () => {
          return ['a'];
        },
      }),
      defineStep({
        id: 'access',
        needs: ['session'],
        run: () => {
          return ['reader'];
        },
      }),
    ],
  });

  const outcome = await boot.run();
  expect(outcome.status).toBe('degraded');
  expect(outcome.data['access']).toEqual(['reader']);
  const outcomeOf = (id: string): string | undefined => {
    return outcome.timeline.find((trace) => {
      return trace.id === id;
    })?.status;
  };
  expect(outcomeOf('lists')).toBe('skipped');
  expect(outcomeOf('access')).toBe('success');
  expect(outcome.errors[0]?.tolerated).toBe(true);
});

test('a non-Error throw is normalized rather than lost', async () => {
  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'odd',
        run: () => {
          // oxlint-disable-next-line typescript/only-throw-error -- the point of the test
          throw 'a string';
        },
      }),
    ],
  });

  const outcome = await boot.run();
  expect(outcome.status).toBe('failed');
  expect(outcome.errors[0]?.error.message).toBe('a string');
});

test('a step that exceeds its own timeout is timed-out, not failed', async () => {
  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'slow',
        timeout: 20,
        run: async () => {
          await sleep(500);
          return 1;
        },
      }),
    ],
  });

  const outcome = await boot.run();
  expect(outcome.status).toBe('failed');
  expect(outcome.errors[0]?.status).toBe('timed-out');
});

test('the deadline bounds a run whose step ignores its signal', async () => {
  const boot = createBootstrap({
    deadline: 30,
    steps: [
      defineStep({
        id: 'stubborn',
        run: async () => {
          await sleep(2000);
          return 1;
        },
      }),
    ],
  });

  const outcome = await boot.run();
  expect(outcome.status).toBe('aborted');
});

test('an external abort ends the run and keeps what was already recorded', async () => {
  const controller = new AbortController();
  const boot = createBootstrap({
    signal: controller.signal,
    steps: [
      defineStep({
        id: 'watched',
        run: async (ctx) => {
          ctx.notice('boot:started');
          controller.abort();
          await sleep(500);
          return 1;
        },
      }),
    ],
  });

  const outcome = await boot.run();
  expect(outcome.status).toBe('aborted');
  expect(
    outcome.notices.map((notice) => {
      return notice.type;
    })
  ).toEqual(['boot:started']);
});

test('block refuses the mount and keeps the notices and intents that explain it', async () => {
  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'guard',
        run: (ctx) => {
          ctx.notice('guard:checked');
          ctx.intent('redirect', { to: '/login' });
          return ctx.block('no session');
        },
      }),
    ],
  });

  const outcome = await boot.run();
  expect(outcome.status).toBe('blocked');
  expect(outcome.status === 'ready' ? undefined : outcome.blockedBy).toEqual({
    step: 'guard',
    reason: 'no session',
  });
  expect(outcome.notices).toHaveLength(1);
  expect(outcome.intents[0]?.type).toBe('redirect');
  expect(outcome.intents[0]?.status).toBe('pending');
});

test('two refusals in one level settle by plan order', async () => {
  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'first',
        run: (ctx) => {
          return ctx.block('first refused');
        },
      }),
      defineStep({
        id: 'second',
        run: (ctx) => {
          return ctx.block('second refused');
        },
      }),
    ],
  });

  const outcome = await boot.run();
  expect(outcome.status).toBe('blocked');
  expect(outcome.status === 'ready' ? undefined : outcome.blockedBy).toEqual({
    step: 'first',
    reason: 'first refused',
  });
});

test('a refusal that arrives after the run settled does not rewrite the answer', async () => {
  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'slow-guard',
        run: async (ctx) => {
          await sleep(40);
          return ctx.block('too late to matter');
        },
      }),
      defineStep({
        id: 'fast-guard',
        run: (ctx) => {
          return ctx.block('the real reason');
        },
      }),
    ],
  });

  const outcome = await boot.run();
  expect(outcome.status).toBe('blocked');
  expect(outcome.status === 'ready' ? undefined : outcome.blockedBy?.reason).toBe(
    'the real reason'
  );

  // The slow guard is still running. Give it the time it asked for and confirm the answer stands.
  await sleep(80);
  expect(outcome.status === 'ready' ? undefined : outcome.blockedBy?.step).toBe('fast-guard');
});

test('an intent outlives the failure of the step that queued it', async () => {
  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'token',
        run: (ctx) => {
          ctx.intent('redirect', { to: '/login' });
          throw new Error('refresh failed');
        },
      }),
    ],
  });

  const outcome = await boot.run();
  expect(outcome.status).toBe('failed');
  expect(outcome.intents[0]?.origin).toEqual({ step: 'token', stepStatus: 'failed' });
});

test('the same intent type twice is one record with a count', async () => {
  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'twice',
        run: (ctx) => {
          ctx.intent('warn', { a: 1 });
          ctx.intent('warn', { a: 2 });
          return 1;
        },
      }),
    ],
  });

  const outcome = await boot.run();
  expect(outcome.intents).toHaveLength(1);
  expect(outcome.intents[0]?.occurrences).toBe(2);
  expect(outcome.intents[0]?.payload).toEqual({ a: 1 });
});

test('a write after the step settled is counted, not thrown', async () => {
  let late: (() => void) | undefined;
  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'leaky',
        run: (ctx) => {
          late = () => {
            ctx.notice('too:late');
          };
          return 1;
        },
      }),
    ],
  });

  const outcome = await boot.run();
  expect(() => {
    late?.();
  }).not.toThrow();
  expect(outcome.notices).toHaveLength(0);
});

test('reading a dependency that was not declared throws', async () => {
  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'a',
        run: () => {
          return 1;
        },
      }),
      defineStep({
        id: 'b',
        run: (ctx) => {
          // The type rejects this too; the runtime check is what makes an undeclared read
          // impossible rather than merely discouraged.
          const sneaky: { get: (id: string) => unknown } = ctx;
          return sneaky.get('a');
        },
      }),
    ],
  });

  const outcome = await boot.run();
  expect(outcome.errors[0]?.error.name).toBe('UndeclaredDependencyError');
});

test('run twice returns the same outcome and executes each step once', async () => {
  let calls = 0;
  const steps: AnyStep[] = [
    defineStep({
      id: 'counted',
      run: () => {
        calls += 1;
        return calls;
      },
    }),
  ];
  const boot = createBootstrap({ steps });

  const first = await boot.run();
  const second = await boot.run();

  expect(calls).toBe(1);
  expect(second).toBe(first);
});

test('a branch that does not apply is skipped, not failed', async () => {
  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'config',
        run: () => {
          return { isPreview: false };
        },
      }),
      defineStep({
        id: 'debug-overlay',
        needs: ['config'],
        run: (ctx) => {
          // The whole point: a branch the run is meant to go without, said without lying.
          return ctx.skip('not a preview build');
        },
      }),
      defineStep({
        id: 'debug-recorder',
        needs: ['debug-overlay'],
        run: () => {
          return { on: true };
        },
      }),
    ],
  });

  const outcome = await boot.run();
  const statusOf = (id: string) => {
    return outcome.timeline.find((trace) => {
      return trace.id === id;
    })?.status;
  };

  // Nothing degraded, because nothing went wrong.
  expect(outcome.status).toBe('ready');
  expect(outcome.errors).toEqual([]);

  expect(statusOf('debug-overlay')).toBe('skipped');
  // Pruned by the ordinary rule, which is what makes this a branch rather than one step.
  expect(statusOf('debug-recorder')).toBe('skipped');
  expect(outcome.data['config']).toEqual({ isPreview: false });
});

test('the branch runs when it does apply, and nothing about it is special', async () => {
  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'config',
        run: () => {
          return { isPreview: true };
        },
      }),
      defineStep({
        id: 'debug-overlay',
        needs: ['config'],
        run: (ctx) => {
          // `config` is not in this suite's registry, so its data is the untyped boundary every
          // test here meets — the id is what would re-attach a declared type.
          const config = ctx.get('config') as { isPreview: boolean };
          return config.isPreview ? { mounted: true } : ctx.skip();
        },
      }),
      defineStep({
        id: 'debug-recorder',
        needs: ['debug-overlay'],
        run: () => {
          return { on: true };
        },
      }),
    ],
  });

  const outcome = await boot.run();

  expect(outcome.status).toBe('ready');
  expect(outcome.data['debug-overlay']).toEqual({ mounted: true });
  expect(outcome.data['debug-recorder']).toEqual({ on: true });
});

test('a required step that skips takes its dependents with it and still does not fail the run', async () => {
  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'probe',
        run: (ctx) => {
          return ctx.skip();
        },
      }),
      defineStep({
        id: 'reads-it',
        needs: ['probe'],
        run: () => {
          return { any: true };
        },
      }),
    ],
  });

  const outcome = await boot.run();

  // `optional` is about tolerating a *failure*; skipping is not one, so the flag has no part in it.
  expect(outcome.status).toBe('ready');
  expect(outcome.errors).toEqual([]);
  expect(outcome.data['reads-it']).toBeUndefined();
});
