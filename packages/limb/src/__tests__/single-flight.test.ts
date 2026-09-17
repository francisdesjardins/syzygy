import { expect, test } from '@playwright/test';
import { createSingleFlight } from '../single-flight';

const tick = (ms: number) => {
  return new Promise<void>((r) => {
    return setTimeout(r, ms);
  });
};

test.describe('createSingleFlight — first mode (default)', () => {
  test('concurrent callers share a single in-flight task', async () => {
    const flight = createSingleFlight();
    let calls = 0;
    const task = async (): Promise<string> => {
      calls++;
      await tick(10);
      return 'x';
    };

    const [a, b] = [flight(task), flight(task)];
    expect(calls).toBe(1);
    expect(await a).toBe('x');
    expect(await b).toBe('x');
  });

  test('a fresh call runs the task again once the previous settled', async () => {
    const flight = createSingleFlight();
    let calls = 0;
    const task = async (): Promise<number> => {
      calls++;
      await tick(1);
      return calls;
    };

    await flight(task);
    await flight(task);
    expect(calls).toBe(2);
  });

  test('a joiner never runs its own task — it adopts the one already in flight', async () => {
    const flight = createSingleFlight();
    const work = Promise.withResolvers<string>();
    let joinerRan = false;

    const first = flight(() => {
      return work.promise;
    });
    const joiner = flight(() => {
      joinerRan = true;
      return Promise.resolve('mine');
    });

    work.resolve('theirs');
    expect(await first).toBe('theirs');
    expect(await joiner).toBe('theirs');
    expect(joinerRan).toBe(false);
  });

  test('the signal is inert — a joiner cannot cancel the flight it joined', async () => {
    const flight = createSingleFlight();
    const work = Promise.withResolvers<string>();
    let signal: AbortSignal | undefined;
    let aborts = 0;

    const first = flight((s) => {
      signal = s;
      s.addEventListener('abort', () => {
        aborts++;
      });
      return work.promise;
    });
    const joiner = flight(() => {
      return Promise.resolve('unused');
    });

    // Every caller in this mode owns the same result, so none of them may take it away.
    expect(signal?.aborted).toBe(false);
    work.resolve('shared');
    expect(await first).toBe('shared');
    expect(await joiner).toBe('shared');
    expect(signal?.aborted).toBe(false);
    expect(aborts).toBe(0);
  });

  test('a rejection reaches every caller as the same error instance', async () => {
    const flight = createSingleFlight();
    const work = Promise.withResolvers<string>();
    const boom = new Error('boom');

    const first = flight(() => {
      return work.promise;
    });
    const joiner = flight(() => {
      return work.promise;
    });

    work.reject(boom);
    await expect(first).rejects.toBe(boom);
    await expect(joiner).rejects.toBe(boom);
  });

  test('a rejection reopens the gate — the next call runs the task again', async () => {
    const flight = createSingleFlight();
    const work = Promise.withResolvers<string>();
    let calls = 0;

    const failed = flight(() => {
      calls++;
      return work.promise;
    });
    work.reject(new Error('boom'));
    await expect(failed).rejects.toThrow('boom');

    // A failure the gate keeps holding would be permanent: nothing ever retries.
    const recovered = await flight(() => {
      calls++;
      return Promise.resolve('recovered');
    });
    expect(recovered).toBe('recovered');
    expect(calls).toBe(2);
  });

  test('two gates share no state', async () => {
    const one = createSingleFlight();
    const other = createSingleFlight();
    let calls = 0;
    const task = () => {
      calls++;
      return Promise.resolve(calls);
    };

    await Promise.all([one(task), other(task)]);
    expect(calls).toBe(2);
  });

  test('two gates in last mode share no state either', async () => {
    // The default mode keeps one variable per instance; `last` keeps five, and a single one of them
    // hoisted to module scope makes two independent gates answer for each other. Counting calls
    // cannot see that — the wrong *promise* comes back, and one gate aborts the other's signal.
    const one = createSingleFlight({ mode: 'last' });
    const other = createSingleFlight({ mode: 'last' });

    let oneSignal: AbortSignal | undefined;
    const fromOne = one((signal) => {
      oneSignal = signal;
      return Promise.resolve('one');
    });
    const fromOther = other(() => {
      return Promise.resolve('other');
    });

    expect(fromOne).not.toBe(fromOther);
    expect(await fromOne).toBe('one');
    expect(await fromOther).toBe('other');
    expect(oneSignal?.aborted).toBe(false);
  });
});

test.describe('createSingleFlight — last mode', () => {
  test('a new call aborts the previous; all callers resolve to the latest result', async () => {
    const flight = createSingleFlight({ mode: 'last' });
    let firstSignal: AbortSignal | undefined;

    const p1 = flight(async (signal) => {
      firstSignal = signal;
      await tick(20);
      return 'a';
    });
    const p2 = flight(async () => {
      await tick(1);
      return 'b';
    });

    expect(firstSignal?.aborted).toBe(true);
    expect(await p1).toBe('b');
    expect(await p2).toBe('b');
  });

  test('the abort lands before the replacement task starts, with an AbortError reason', async () => {
    const flight = createSingleFlight({ mode: 'last' });
    const stale = Promise.withResolvers<string>();
    const fresh = Promise.withResolvers<string>();
    let staleSignal: AbortSignal | undefined;
    let freshSignal: AbortSignal | undefined;
    let staleAbortedAtHandover: boolean | undefined;

    const first = flight((signal) => {
      staleSignal = signal;
      return stale.promise;
    });
    const second = flight((signal) => {
      freshSignal = signal;
      staleAbortedAtHandover = staleSignal?.aborted;
      return fresh.promise;
    });

    // A request cut only after its successor is issued leaves both on the wire at once.
    expect(staleAbortedAtHandover).toBe(true);
    expect((staleSignal?.reason as Error | undefined)?.name).toBe('AbortError');
    expect(freshSignal?.aborted).toBe(false);

    fresh.resolve('fresh');
    expect(await first).toBe('fresh');
    expect(await second).toBe('fresh');
    expect(freshSignal?.aborted).toBe(false);
  });

  test('with three in flight only the newest generation may settle the shared promise', async () => {
    const flight = createSingleFlight({ mode: 'last' });
    const work = [
      Promise.withResolvers<string>(),
      Promise.withResolvers<string>(),
      Promise.withResolvers<string>(),
    ] as const;
    const signals: AbortSignal[] = [];
    const promises = work.map((one) => {
      return flight((signal) => {
        signals.push(signal);
        return one.promise;
      });
    });

    expect(
      signals.map((signal) => {
        return signal.aborted;
      })
    ).toEqual([true, true, false]);

    // The middle generation answering first is what a guard that only skips the immediately
    // previous call would wave through.
    work[1].resolve('b');
    await work[1].promise;
    work[0].resolve('a');
    await work[0].promise;
    work[2].resolve('c');

    expect(await Promise.all(promises)).toEqual(['c', 'c', 'c']);
  });

  test('a superseded task that ignores its signal still loses', async () => {
    const flight = createSingleFlight({ mode: 'last' });
    const stale = Promise.withResolvers<string>();
    const fresh = Promise.withResolvers<string>();

    const first = flight(() => {
      return stale.promise;
    });
    const second = flight(() => {
      return fresh.promise;
    });

    // Abort is advisory: a task may well finish, and its answer is still the outdated one.
    stale.resolve('stale');
    await stale.promise;
    fresh.resolve('fresh');

    expect(await first).toBe('fresh');
    expect(await second).toBe('fresh');
  });

  test('a superseded rejection is swallowed rather than surfaced', async () => {
    const flight = createSingleFlight({ mode: 'last' });
    const stale = Promise.withResolvers<string>();
    const fresh = Promise.withResolvers<string>();

    const first = flight(() => {
      return stale.promise;
    });
    const second = flight(() => {
      return fresh.promise;
    });

    // The abort is what makes the previous call fail, so that failure is nobody's answer.
    stale.reject(new Error('aborted'));
    await stale.promise.catch(() => {});
    fresh.resolve('fresh');

    expect(await first).toBe('fresh');
    expect(await second).toBe('fresh');
  });

  test('the newest rejection reaches every caller, including the one it superseded', async () => {
    const flight = createSingleFlight({ mode: 'last' });
    const stale = Promise.withResolvers<string>();
    const fresh = Promise.withResolvers<string>();
    const boom = new Error('boom');

    const first = flight(() => {
      return stale.promise;
    });
    const second = flight(() => {
      return fresh.promise;
    });

    fresh.reject(boom);
    await expect(first).rejects.toBe(boom);
    await expect(second).rejects.toBe(boom);
  });

  test('a settled flight hands the next call a promise of its own', async () => {
    const flight = createSingleFlight({ mode: 'last' });

    const first = flight(() => {
      return Promise.resolve('a');
    });
    expect(await first).toBe('a');

    // Handing back the settled promise would replay the stale answer for ever.
    const second = flight(() => {
      return Promise.resolve('b');
    });
    expect(second).not.toBe(first);
    expect(await second).toBe('b');
  });

  test('a rejected flight also hands the next call a promise of its own', async () => {
    const flight = createSingleFlight({ mode: 'last' });

    const failed = flight(() => {
      return Promise.reject(new Error('boom'));
    });
    await expect(failed).rejects.toThrow('boom');

    const next = flight(() => {
      return Promise.resolve('recovered');
    });
    expect(next).not.toBe(failed);
    expect(await next).toBe('recovered');
  });

  test('a settled flight is not aborted retroactively by the next call', async () => {
    const flight = createSingleFlight({ mode: 'last' });
    let settledSignal: AbortSignal | undefined;

    await flight((signal) => {
      settledSignal = signal;
      return Promise.resolve('a');
    });
    expect(settledSignal?.aborted).toBe(false);

    // A finished call holds no cancellable work; aborting it would only mislead a task that kept
    // the signal for its own cleanup.
    await flight(() => {
      return Promise.resolve('b');
    });
    expect(settledSignal?.aborted).toBe(false);
  });

  test('a rejected flight is not aborted retroactively either', async () => {
    // The settle path has two branches and they clear the controller separately: a test that only
    // resolves leaves the rejection branch free to keep a dead controller and abort it later.
    const flight = createSingleFlight({ mode: 'last' });
    let deadSignal: AbortSignal | undefined;

    await expect(
      flight((signal) => {
        deadSignal = signal;
        return Promise.reject(new Error('boom'));
      })
    ).rejects.toThrow('boom');
    expect(deadSignal?.aborted).toBe(false);

    await flight(() => {
      return Promise.resolve('next');
    });
    expect(deadSignal?.aborted).toBe(false);
  });

  test('a task superseded before a settlement still loses after it', async () => {
    // Three generations inside one flight does not cover a generation counter *reset* at
    // settlement: a stale task outliving a completed flight would match the fresh count and answer
    // for a call it never belonged to. The later flight has to still be in the air when the ghost
    // arrives — a settled one has no resolver left to hijack, which is what hides the bug.
    const flight = createSingleFlight({ mode: 'last' });
    let releaseStale: ((value: string) => void) | undefined;
    let releaseAfter: ((value: string) => void) | undefined;

    const stale = flight(() => {
      return new Promise<string>((resolve) => {
        releaseStale = resolve;
      });
    });
    const winner = flight(() => {
      return Promise.resolve('winner');
    });
    expect(await winner).toBe('winner');
    expect(await stale).toBe('winner');

    const after = flight(() => {
      return new Promise<string>((resolve) => {
        releaseAfter = resolve;
      });
    });

    // The abandoned task answers only now, two flights late. It must reach nobody.
    releaseStale?.('ghost');
    const pending = Symbol('pending');
    expect(await Promise.race([after, Promise.resolve(pending)])).toBe(pending);

    releaseAfter?.('after');
    expect(await after).toBe('after');
  });
});
