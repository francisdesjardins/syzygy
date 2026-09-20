import { expect, test } from '@playwright/test';
import { createBootstrap } from '../../index.js';
import { defineStep } from '../../index.js';
import { setLogLevel } from '../logger.js';

/**
 * The logger against a real run, rather than against itself.
 *
 * Silence is the claim worth testing: a logger nobody switched on that still formats a line is the
 * overhead this one says it does not have, and no assertion about output would notice.
 */
type Line = { readonly method: string; readonly text: string };

/** Records what reached the console and puts it back, whatever the body did. */
async function capture(body: () => Promise<void>): Promise<Line[]> {
  const lines: Line[] = [];
  const original = { debug: console.debug, warn: console.warn, error: console.error };

  for (const method of ['debug', 'warn', 'error'] as const) {
    console[method] = (...args: unknown[]) => {
      lines.push({ method, text: args.map(String).join(' ') });
    };
  }

  try {
    await body();
  } finally {
    Object.assign(console, original);
    setLogLevel(false);
  }
  return lines;
}

function boot() {
  return createBootstrap({
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
        run: (ctx) => {
          return ctx.get('session');
        },
      }),
    ],
  });
}

test('nothing reaches the console until a level is set', async () => {
  const lines = await capture(async () => {
    await boot().run();
  });

  expect(lines).toEqual([]);
});

test('a run under `*` reports its plan, its steps and how it settled', async () => {
  const lines = await capture(async () => {
    setLogLevel('*');
    await boot().run();
  });

  const text = lines.map((line) => {
    return line.text;
  });

  for (const namespace of ['boot:plan', 'boot:run']) {
    expect(
      text.some((line) => {
        return line.includes(namespace);
      }),
      `nothing was logged under ${namespace}`
    ).toBe(true);
  }
  expect(
    text.filter((line) => {
      return line.includes('boot:step') && line.includes('Step success');
    })
  ).toHaveLength(2);
});

test('a pattern narrows to its own namespace, under either spelling', async () => {
  for (const pattern of ['step', 'boot:step']) {
    const lines = await capture(async () => {
      setLogLevel(pattern);
      await boot().run();
    });

    expect(
      lines.every((line) => {
        return line.text.includes('boot:step');
      }),
      `"${pattern}" let another namespace through`
    ).toBe(true);
    expect(lines.length).toBe(2);
  }
});

/**
 * One bootstrap each, because a refusal aborts its level: the two endings cannot be asked for in
 * one run without the second becoming a cancellation.
 */
async function endingOf(step: ReturnType<typeof defineStep>): Promise<Line | undefined> {
  const lines = await capture(async () => {
    setLogLevel('step');
    await createBootstrap({ steps: [step] }).run();
  });
  return lines[0];
}

test('a step that throws is an error line, and a refusal is not', async () => {
  const failed = await endingOf(
    defineStep({
      id: 'broken',
      run: () => {
        throw new Error('boom');
      },
    })
  );
  const blocked = await endingOf(
    defineStep({
      id: 'refused',
      run: (ctx) => {
        return ctx.block('no-session');
      },
    })
  );

  expect(failed?.text).toContain('Step failed');
  expect(failed?.method).toBe('error');
  expect(blocked?.text).toContain('Step blocked');
  // A refusal is a decision the step made, so raising a warning about it would train a reader to
  // ignore warnings.
  expect(blocked?.method).toBe('debug');
});
