import { expect, test } from '@playwright/test';
import { createMutex } from '../mutex';

const tick = (ms: number) => {
  return new Promise<void>((r) => {
    return setTimeout(r, ms);
  });
};

/**
 * One macrotask boundary, which by definition drains every microtask queued behind it. The mutex
 * chains with `.then` alone, so whatever is still pending once this resolves is pending for good.
 */
const settle = () => {
  return new Promise<void>((resolve) => {
    return setImmediate(resolve);
  });
};

test.describe('createMutex', () => {
  test('serializes tasks — each runs only after the previous settles', async () => {
    const mutex = createMutex();
    const order: string[] = [];

    const a = mutex(async () => {
      await tick(20);
      order.push('a');
    });
    const b = mutex(async () => {
      await tick(1);
      order.push('b');
    });

    await Promise.all([a, b]);
    // Even though b is faster, it waits for a to finish first.
    expect(order).toEqual(['a', 'b']);
  });

  test('a rejected task does not break the chain', async () => {
    const mutex = createMutex();
    const order: string[] = [];

    const failing = mutex(async () => {
      await tick(5);
      throw new Error('boom');
    });
    const next = mutex(async () => {
      await Promise.resolve();
      order.push('after');
    });

    await expect(failing).rejects.toThrow('boom');
    await next;
    expect(order).toEqual(['after']);
  });

  test('returns the task result', async () => {
    const mutex = createMutex();
    expect(
      await mutex(() => {
        return Promise.resolve(42);
      })
    ).toBe(42);
  });

  test('finishes in call order however the tasks are released', async () => {
    const mutex = createMutex();
    const log: string[] = [];
    let running = 0;
    let peak = 0;
    const holds = [0, 1, 2, 3].map(() => {
      return Promise.withResolvers<void>();
    });

    const runs = holds.map((hold, index) => {
      return mutex(async () => {
        running += 1;
        peak = Math.max(peak, running);
        log.push(`start ${index}`);
        await hold.promise;
        running -= 1;
        log.push(`end ${index}`);
        return index;
      });
    });

    await settle();
    expect(log).toEqual(['start 0']);

    // Releasing last-to-first: anything that dispatches on readiness rather than on arrival order
    // would come back inverted here.
    for (const hold of [...holds].reverse()) {
      hold.resolve();
    }

    expect(await Promise.all(runs)).toEqual([0, 1, 2, 3]);
    expect(peak).toBe(1);
    expect(log).toEqual([
      'start 0',
      'end 0',
      'start 1',
      'end 1',
      'start 2',
      'end 2',
      'start 3',
      'end 3',
    ]);
  });

  test('a task that throws synchronously rejects its caller instead of the mutex', async () => {
    const mutex = createMutex();
    const boom = new Error('sync');
    let call: Promise<never> | undefined;

    // The caller has returned by the time the chain runs the task, so a synchronous throw has
    // nowhere left to land but the promise it was handed.
    expect(() => {
      call = mutex((): Promise<never> => {
        throw boom;
      });
      return call;
    }).not.toThrow();

    await expect(call).rejects.toBe(boom);
    expect(
      await mutex(() => {
        return Promise.resolve('next');
      })
    ).toBe('next');
  });

  test('a rejection reaches its caller unwrapped', async () => {
    const mutex = createMutex();
    const boom = new Error('identity');

    await expect(
      mutex(() => {
        return Promise.reject(boom);
      })
    ).rejects.toBe(boom);
  });

  test('a call on an idle chain still waits its turn before running', async () => {
    const mutex = createMutex();
    await mutex(() => {
      return Promise.resolve('first');
    });

    let started = false;
    const second = mutex(() => {
      started = true;
      return Promise.resolve('second');
    });

    // Idle or busy, nothing runs inside the call itself — which is what lets a caller queue several
    // tasks before any of them observes the world.
    expect(started).toBe(false);
    expect(await second).toBe('second');

    // And the turn is a real one, not a single deferral: a lock replaced by `Promise.resolve()
    // .then(run)` also leaves `started` false above, so the queued task has to be made to wait
    // behind work that spans several turns.
    const order: string[] = [];
    const slow = mutex(async () => {
      for (let turn = 0; turn < 8; turn += 1) {
        await Promise.resolve();
      }
      order.push('slow');
      return 'slow';
    });
    const quick = mutex(() => {
      order.push('quick');
      return Promise.resolve('quick');
    });

    await Promise.all([slow, quick]);
    expect(order).toEqual(['slow', 'quick']);
  });

  test('is not reentrant — a nested call deadlocks both tasks', async () => {
    const mutex = createMutex();
    const settled: string[] = [];
    let innerStarted = false;

    const outer = mutex(async () => {
      await mutex(() => {
        innerStarted = true;
        return Promise.resolve('inner');
      });
      return 'outer';
    });
    void outer.then(
      (value) => {
        return settled.push(value);
      },
      () => {
        return settled.push('rejected');
      }
    );

    await settle();
    // The outer task waits on the lock it is itself holding; neither half can ever move again.
    expect(innerStarted).toBe(false);
    expect(settled).toEqual([]);
  });

  test('each mutex holds its own chain', async () => {
    const held = createMutex();
    const other = createMutex();
    const blocker = Promise.withResolvers<void>();

    const blocked = held(() => {
      return blocker.promise;
    });

    expect(
      await other(() => {
        return Promise.resolve('free');
      })
    ).toBe('free');

    blocker.resolve();
    await blocked;
  });
});

test.describe('createMutex — a promise argument', () => {
  test('has already started; only its settlement is serialized', async () => {
    const mutex = createMutex();
    const order: string[] = [];
    const hold = Promise.withResolvers<void>();

    const held = mutex(async () => {
      await hold.promise;
      for (let turn = 0; turn < 8; turn += 1) {
        await Promise.resolve();
      }
      order.push('held');
    });
    const passed = new Promise<string>((resolve) => {
      order.push('passed body');
      resolve('passed');
    });
    const adopted = mutex(passed);

    // An executor runs at construction, so the mutual exclusion a caller expects is already lost
    // before the mutex is handed the promise — only the resolution order is still the mutex's to
    // give.
    expect(order).toEqual(['passed body']);

    // Still the mutex's to give: the adopted promise may not settle while the holder is in flight.
    // Asserting only the final order lets a lock replaced by a fixed number of microtask hops pass
    // by coincidence, so the holder is made to span more turns than any fixed hop count.
    const pending = Symbol('pending');
    expect(await Promise.race([adopted, Promise.resolve(pending)])).toBe(pending);

    hold.resolve();
    expect(await adopted).toBe('passed');
    expect(order).toEqual(['passed body', 'held']);
    await held;
  });

  test('rejects its caller and leaves the chain usable', async () => {
    const mutex = createMutex();
    const boom = new Error('promise branch');

    await expect(mutex(Promise.reject(boom))).rejects.toBe(boom);
    expect(
      await mutex(() => {
        return Promise.resolve('after');
      })
    ).toBe('after');
  });

  test('is not reported as unhandled while it waits behind a busy chain', async () => {
    const mutex = createMutex();
    const boom = new Error('queued');
    const hold = Promise.withResolvers<void>();

    const held = mutex(() => {
      return hold.promise;
    });
    const queued = mutex(Promise.reject(boom));
    const caught = queued.catch((error: unknown) => {
      return error;
    });

    // The catch above cannot reach the rejection until the gate opens, and the gate cannot open
    // within this turn: without a handler claimed at call time the runtime calls it unhandled and
    // kills the run before the assertion below.
    await settle();

    hold.resolve();
    await held;
    expect(await caught).toBe(boom);
  });
});
