import { expect, test } from '@playwright/test';
import { bindBootstrap } from '../../plain/bind-bootstrap.js';
import { createBootstrap } from '../create-bootstrap.js';
import { attachIntentHost } from '../intent-host.js';
import { defineHostedStep, defineStep } from '../define-step.js';
import { BootstrapError } from '../errors.js';
import type { Intent } from '../types.js';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

test('session is unavailable before the run resolves', () => {
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
  expect(() => {
    return boot.session();
  }).toThrow(BootstrapError);
});

test('subscribe replays what is already queued', async () => {
  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'guard',
        run: (ctx) => {
          ctx.intent('warn', { why: 'trial' });
          return 1;
        },
      }),
    ],
  });
  await boot.run();
  const session = boot.session();

  const seen: Intent[][] = [];
  const unsubscribe = session.subscribe((state) => {
    seen.push([...state.intents]);
  });

  expect(seen[0]).toHaveLength(1);
  expect(seen[0]?.[0]?.type).toBe('warn');
  unsubscribe();
});

test('unsubscribing really stops the listener', async () => {
  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'guard',
        run: (ctx) => {
          ctx.intent('warn', {});
          return 1;
        },
      }),
    ],
  });
  await boot.run();
  const session = boot.session();

  let calls = 0;
  const unsubscribe = session.subscribe(() => {
    calls += 1;
  });
  expect(calls).toBe(1);
  unsubscribe();
  session.forward();
  expect(calls).toBe(1);
});

test('forward moves only pending intents and a second forward still works', async () => {
  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'guard',
        run: (ctx) => {
          ctx.intent('warn', {});
          return 1;
        },
      }),
    ],
  });
  await boot.run();
  const session = boot.session();

  expect(session.forward()).toHaveLength(1);
  expect(session.forward()).toHaveLength(0);
  expect(session.list()[0]?.status).toBe('forwarded');

  session.settle(session.list()[0]?.id ?? '');
  expect(session.list()[0]?.status).toBe('handled');
});

test('a filter leaves the rest pending', async () => {
  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'guard',
        run: (ctx) => {
          ctx.intent('warn', {});
          ctx.intent('redirect', {});
          return 1;
        },
      }),
    ],
  });
  await boot.run();
  const session = boot.session();

  const forwarded = session.forward((intent) => {
    return intent.type === 'warn';
  });
  expect(forwarded).toHaveLength(1);
  expect(
    session.list().find((intent) => {
      return intent.type === 'redirect';
    })?.status
  ).toBe('pending');
});

test('dispose drops what nobody forwarded, with the reason on the record', async () => {
  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'guard',
        run: (ctx) => {
          ctx.intent('warn', {});
          return 1;
        },
      }),
    ],
  });
  await boot.run();
  const session = boot.session();

  session.dispose();
  expect(session.list()[0]?.status).toBe('dropped');
  expect(session.list()[0]?.droppedReason).toBe('not-forwarded');
});

test('a mounted step reaches the UI port and waits for the app to settle its intent', async () => {
  const answered: string[] = [];

  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'config',
        run: () => {
          return { daysLeft: 3 };
        },
      }),
      defineHostedStep({
        id: 'trial-warning',
        needs: ['config'],
        run: async (ctx) => {
          const port: { note?: (message: string) => void } = ctx.host;
          port.note?.('about to warn');
          await ctx.awaitIntent('warn:trial', { daysLeft: 3 });
          answered.push('released');
        },
      }),
    ],
  });

  await boot.run();
  const session = boot.session();

  const bound = bindBootstrap(session, {
    host: {
      note: (message: string) => {
        answered.push(message);
      },
    },
    onIntent: (intent, controls) => {
      // The host decides. Here it says yes, after a tick, the way a dialog would.
      void sleep(10).then(() => {
        answered.push(`shown:${String(intent.type)}`);
        controls.settle();
      });
    },
  });

  await bound.mounted;
  expect(answered).toEqual(['about to warn', 'shown:warn:trial', 'released']);
  bound.destroy();
});

test('a dropped intent rejects the mounted step that was waiting on it', async () => {
  const boot = createBootstrap({
    steps: [
      defineHostedStep({
        id: 'asks',
        run: async (ctx) => {
          await ctx.awaitIntent('confirm', {});
        },
      }),
    ],
  });

  await boot.run();
  const session = boot.session();

  const bound = bindBootstrap(session, {
    host: {},
    onIntent: (_intent, controls) => {
      controls.drop('the host does not do confirmations');
    },
  });

  await bound.mounted;
  expect(session.list()[0]?.status).toBe('dropped');
  expect(session.list()[0]?.droppedReason).toBe('the host does not do confirmations');
  bound.destroy();
});

test('mounting after dispose is refused', async () => {
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
  await boot.run();
  const session = boot.session();
  session.dispose();

  await expect(session.attach({})).rejects.toThrow(BootstrapError);
});

test('mount is idempotent, so a re-attaching binding does not ask twice', async () => {
  let runs = 0;
  const boot = createBootstrap({
    steps: [
      defineHostedStep({
        id: 'asks-once',
        run: () => {
          runs += 1;
        },
      }),
    ],
  });
  await boot.run();
  const session = boot.session();

  const first = session.attach({});
  const second = session.attach({});
  expect(second).toBe(first);
  await first;

  await session.attach({});
  expect(runs).toBe(1);
});

test('the two kinds of destroy differ on what nobody forwarded', async () => {
  const build = async () => {
    const boot = createBootstrap({
      steps: [
        defineStep({
          id: 'guard',
          run: (ctx) => {
            ctx.intent('warn', {});
            return 1;
          },
        }),
      ],
    });
    await boot.run();
    return boot.session();
  };

  // A host that takes nothing, so the intent is still pending when each destroy runs. That is the
  // only state the two kinds of teardown disagree about.
  const refuses = {
    host: {},
    onIntent: () => {
      return undefined;
    },
    accepts: () => {
      return false;
    },
  };

  const forFramework = await build();
  const host = attachIntentHost(forFramework, refuses);
  await host.mounted;
  host.destroy();
  // A component unmounting is not the app shutting down, so the queue survives for the next host.
  expect(forFramework.list()[0]?.status).toBe('pending');

  const forPage = await build();
  const bound = bindBootstrap(forPage, refuses);
  await bound.mounted;
  bound.destroy();
  // The controller binding has no component behind it, so its destroy means the page is done.
  expect(forPage.list()[0]?.status).toBe('dropped');
  expect(forPage.list()[0]?.droppedReason).toBe('not-forwarded');
});

test('attachIntentHost leaves the session alive when its host goes away', async () => {
  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'guard',
        run: (ctx) => {
          ctx.intent('warn', {});
          return 1;
        },
      }),
    ],
  });
  await boot.run();
  const session = boot.session();

  const ignore = {
    host: {},
    onIntent: () => {
      return undefined;
    },
  };
  const host = attachIntentHost(session, ignore);
  await host.mounted;
  host.destroy();

  // Still forwarded, not dropped: a component unmounting is not the app shutting down, and a second
  // host attaching after this one must still find the queue it was given.
  expect(session.list()[0]?.status).toBe('forwarded');

  const replacement = attachIntentHost(session, ignore);
  await replacement.mounted;
  replacement.destroy();
  expect(session.list()[0]?.status).toBe('forwarded');
});

test('the mounted phase reaches the session state, not only the caller that awaited it', async () => {
  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'config',
        run: () => {
          return { daysLeft: 3 };
        },
      }),
      defineHostedStep({
        id: 'warn',
        needs: ['config'],
        run: () => {
          return undefined;
        },
      }),
    ],
  });
  await boot.run();
  const session = boot.session();

  const seen: Array<string | undefined> = [];
  const unsubscribe = session.subscribe((state) => {
    seen.push(
      state.mount?.timeline.find((trace) => {
        return trace.id === 'warn';
      })?.status
    );
  });

  expect(seen).toEqual([undefined]);
  await session.attach({});

  // The graph a binding draws needs this half: without it the mounted step stays unresolved on
  // screen for ever, whatever it actually did.
  expect(seen.at(-1)).toBe('success');
  unsubscribe();
});

test('settling an intent nobody emitted says so rather than going quiet', async () => {
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
  await boot.run();
  const session = boot.session();

  // `settle` and `drop` take a bare string off the host, so this is host misuse rather than an
  // internal invariant — it has to be an error the host can catch and not a silent no-op.
  expect(() => {
    session.settle('no-such-intent');
  }).toThrow(BootstrapError);
  expect(() => {
    session.drop('no-such-intent', 'whatever');
  }).toThrow(BootstrapError);
});

test('the same intent type twice in the mounted phase is one record that counts occurrences', async () => {
  const boot = createBootstrap({
    steps: [
      defineHostedStep({
        id: 'warns-twice',
        run: (ctx) => {
          ctx.intent('warn', { why: 'first' });
          ctx.intent('warn', { why: 'second' });
        },
      }),
    ],
  });

  await boot.run();
  const session = boot.session();

  const bound = bindBootstrap(session, {
    host: {},
    onIntent: (_intent, controls) => {
      controls.settle();
    },
  });
  await bound.mounted;

  // One record, not two: the second emit of a type already queued is folded into the first so a
  // host that renders one dialog per intent does not get a second one for the same thing.
  const warnings = session.list().filter((intent) => {
    return intent.type === 'warn';
  });
  expect(warnings).toHaveLength(1);
  expect(warnings[0]?.occurrences).toBe(2);
  bound.destroy();
});

test('a mounted step whose dependency failed never runs', async () => {
  const ran: string[] = [];
  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'config',
        // Optional, so the run reaches the mounted phase at all rather than failing outright —
        // which is what makes the skip below observable.
        optional: true,
        run: () => {
          throw new Error('503');
        },
      }),
      defineHostedStep({
        id: 'needs-config',
        needs: ['config'],
        run: () => {
          ran.push('needs-config');
        },
      }),
    ],
  });

  await boot.run();
  const session = boot.session();

  const bound = bindBootstrap(session, {
    host: {},
    onIntent: (_intent, controls) => {
      controls.settle();
    },
  });
  await bound.mounted;

  expect(ran).toEqual([]);
  bound.destroy();
});
