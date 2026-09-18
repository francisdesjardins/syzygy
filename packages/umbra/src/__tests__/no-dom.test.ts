import { expect, test } from '@playwright/test';
import { createBootstrap } from '../index.js';
import { defineStep } from '../index.js';

/**
 * The core does not need a DOM, and that is a measurement rather than a prohibition.
 *
 * A binding is free to use the DOM where the DOM is what the job needs; the point is that the layer
 * deciding what runs, in what order, and what the app does about it has no reason to, so it can run
 * in a worker, a service, a test or a server render without a shim.
 *
 * Node has no `document` to begin with, so asserting that nothing broke would pass on a core that
 * reads `globalThis.document` behind a guard. Installing a getter that records the read is what
 * turns absence into evidence.
 */
test('a full run touches no DOM global', async () => {
  const touched: string[] = [];
  const names = ['document', 'window', 'localStorage', 'sessionStorage'];

  for (const name of names) {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      get: () => {
        touched.push(name);
        return undefined;
      },
    });
  }

  try {
    const boot = createBootstrap({
      steps: [
        defineStep({
          id: 'session',
          run: (ctx) => {
            ctx.notice('boot:started');
            return { userId: 'u1' };
          },
        }),
        defineStep({
          id: 'config',
          needs: ['session'],
          run: (ctx) => {
            ctx.intent('warn', {});
            return ctx.get('session');
          },
        }),
      ],
    });

    const outcome = await boot.run();
    const live = boot.live();
    live.forward();
    live.dispose();

    expect(outcome.status).toBe('ready');
    expect(touched).toEqual([]);
  } finally {
    for (const name of names) {
      Reflect.deleteProperty(globalThis, name);
    }
  }
});

test('the timeline survives a round trip through JSON', async () => {
  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'broken',
        run: () => {
          throw new Error('outer', { cause: new Error('inner') });
        },
      }),
    ],
  });

  const outcome = await boot.run();
  const roundTripped: unknown = JSON.parse(JSON.stringify(outcome.timeline));

  expect(roundTripped).toEqual(outcome.timeline);
  expect(outcome.errors[0]?.error.cause?.message).toBe('inner');
});
