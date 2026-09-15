import { expect, test } from '@playwright/test';
import { createBootstrap } from '../create-bootstrap.js';
import { defineMountedStep, defineStep } from '../define-step.js';
import type { RunObserver, RunSnapshot } from '../run-observer.js';
import type { AnyStep } from '../types.js';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function settled<TSteps extends readonly AnyStep[]>(
  observer: RunObserver<TSteps>
): Promise<RunSnapshot<TSteps>> {
  return new Promise<RunSnapshot<TSteps>>((resolve) => {
    const unsubscribe = observer.store.subscribe((snapshot) => {
      if (snapshot.stage === 'settled') {
        resolve(snapshot);
        queueMicrotask(unsubscribe);
      }
    });
  });
}

test('the snapshot walks idle, running, settled', async () => {
  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'session',
        run: async () => {
          await sleep(5);
          return { userId: 'u1' };
        },
      }),
    ],
  });
  const observer = boot.observe();

  const phases: string[] = [];
  observer.store.subscribe((snapshot) => {
    if (phases.at(-1) !== snapshot.stage) {
      phases.push(snapshot.stage);
    }
  });

  expect(observer.store.get().stage).toBe('idle');
  observer.start();
  await settled(observer);

  expect(phases).toEqual(['idle', 'running', 'settled']);
  observer.dispose();
});

test('starting twice runs the bootstrap once', async () => {
  let calls = 0;
  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'counted',
        run: () => {
          calls += 1;
          return calls;
        },
      }),
    ],
  });
  const observer = boot.observe();

  observer.start();
  observer.start();
  await settled(observer);

  expect(calls).toBe(1);
  observer.dispose();
});

test('events accumulate while the run is going', async () => {
  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'a',
        run: async () => {
          await sleep(5);
          return 1;
        },
      }),
      defineStep({
        id: 'b',
        needs: ['a'],
        run: () => {
          return 2;
        },
      }),
    ],
  });
  const observer = boot.observe();
  observer.start();
  const snapshot = await settled(observer);

  // The settle event can land in the same tick as the phase change, so this asserts the shape of
  // the record rather than its exact length.
  expect(snapshot.events[0]?.kind).toBe('run:start');
  expect(
    snapshot.events.filter((event) => {
      return event.kind === 'step:settle';
    })
  ).toHaveLength(2);
  observer.dispose();
});

test('intents queued by the mounted phase reach the snapshot', async () => {
  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'config',
        run: () => {
          return { daysLeft: 3 };
        },
      }),
      defineMountedStep({
        id: 'warn',
        needs: ['config'],
        run: async (ctx) => {
          await ctx.awaitIntent('warn:trial', { daysLeft: 3 });
        },
      }),
    ],
  });
  const observer = boot.observe();
  observer.start();
  const snapshot = await settled(observer);

  expect(snapshot.intents).toHaveLength(0);

  const mounting = snapshot.session?.mount({});
  await sleep(5);
  expect(observer.store.get().intents[0]?.type).toBe('warn:trial');

  const queued = observer.store.get().intents[0];
  snapshot.session?.forward();
  snapshot.session?.settle(queued?.id ?? '');
  await mounting;

  expect(observer.store.get().intents[0]?.status).toBe('handled');
  observer.dispose();
});

test('a disposed observer stops updating', async () => {
  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'a',
        run: async () => {
          await sleep(20);
          return 1;
        },
      }),
    ],
  });
  const observer = boot.observe();
  observer.start();
  observer.dispose();

  await sleep(60);
  expect(observer.store.get().stage).toBe('running');
  expect(observer.store.get().outcome).toBeUndefined();
});

test('an observer built after the run still settles', async () => {
  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'a',
        run: () => {
          return 1;
        },
      }),
    ],
  });

  // The app ran the bootstrap on its own, long before any component mounted.
  await boot.run();

  const observer = boot.observe();
  observer.start();
  const snapshot = await settled(observer);

  expect(snapshot.outcome?.status).toBe('ready');
  // It missed the events, and says so by having none rather than by never settling.
  expect(snapshot.events).toHaveLength(0);
  observer.dispose();
});

test('two observers of one bootstrap are the same observer', () => {
  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'a',
        run: () => {
          return 1;
        },
      }),
    ],
  });
  expect(boot.observe()).toBe(boot.observe());
});
