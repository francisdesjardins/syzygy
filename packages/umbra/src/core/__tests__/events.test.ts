import { expect, test } from '@playwright/test';
import { createBootstrap } from '../create-bootstrap.js';
import { defineStep } from '../define-step.js';
import type { RunEvent } from '../events.js';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function threeSteps() {
  return [
    defineStep({
      id: 'session',
      run: async (ctx) => {
        await sleep(5);
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
  ];
}

test('the stream reports the run and ends on its own', async () => {
  const boot = createBootstrap({ steps: threeSteps() });
  const stream = boot.events();
  const running = boot.run();

  const kinds: string[] = [];
  for await (const event of stream) {
    kinds.push(event.kind);
  }
  await running;

  expect(kinds[0]).toBe('run:start');
  expect(kinds.at(-1)).toBe('run:settle');
  expect(kinds).toContain('level:start');
  expect(kinds).toContain('step:start');
  expect(kinds).toContain('step:settle');
  expect(kinds).toContain('notice');
  expect(kinds).toContain('intent');
});

test('events buffered before the consumer starts reading are not lost', async () => {
  const boot = createBootstrap({ steps: threeSteps() });
  const stream = boot.events();

  // The whole run happens before anything reads the stream.
  const outcome = await boot.run();
  expect(outcome.status).toBe('ready');

  const collected: RunEvent[] = [];
  for await (const event of stream) {
    collected.push(event);
  }

  expect(collected[0]?.kind).toBe('run:start');
  expect(collected.at(-1)?.kind).toBe('run:settle');
});

test('the push form sees the same events as the pull form', async () => {
  const pushed: string[] = [];
  const boot = createBootstrap({
    steps: threeSteps(),
    onEvent: (event) => {
      pushed.push(event.kind);
    },
  });
  const stream = boot.events();
  await boot.run();

  const pulled: string[] = [];
  for await (const event of stream) {
    pulled.push(event.kind);
  }

  expect(pushed).toEqual(pulled);
});

test('a consumer that breaks out of the loop stops listening', async () => {
  const boot = createBootstrap({ steps: threeSteps() });
  const stream = boot.events();
  const running = boot.run();

  let seen = 0;
  for await (const _event of stream) {
    seen += 1;
    break;
  }

  await running;
  expect(seen).toBe(1);
});

test('a failing run still reports its settle event, with the status', async () => {
  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'broken',
        run: () => {
          throw new Error('no');
        },
      }),
    ],
  });
  const stream = boot.events();
  await boot.run();

  const events: RunEvent[] = [];
  for await (const event of stream) {
    events.push(event);
  }

  const last = events.at(-1);
  expect(last?.kind).toBe('run:settle');
  expect(last?.kind === 'run:settle' ? last.status : undefined).toBe('failed');
});

test('a slow consumer still receives the event that ended the run', async () => {
  const boot = createBootstrap({ steps: threeSteps() });
  const stream = boot.events();
  const running = boot.run();

  const kinds: string[] = [];
  for await (const event of stream) {
    // Suspended on every event, which is what pushes the rest of the run into the buffer while the
    // generator is parked on a `yield`. The settle event arrives during one of these waits.
    await sleep(4);
    kinds.push(event.kind);
  }
  await running;

  expect(kinds.at(-1)).toBe('run:settle');
});
