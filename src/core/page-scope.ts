import type { SerializedError } from './types.js';

/** How a shared step ended, in a form another bootstrap can adopt. */
export type SharedResult =
  | { readonly kind: 'value'; readonly value: unknown }
  | { readonly kind: 'blocked'; readonly reason: string }
  | { readonly kind: 'failed'; readonly error: SerializedError };

export type Claim =
  | {
      readonly owned: true;
      /** Publish the result to everyone else waiting on this key. */
      readonly settle: (result: SharedResult) => void;
    }
  | { readonly owned: false; readonly result: Promise<SharedResult> };

type Registry = Map<string, Promise<SharedResult>>;
type Settlers = Map<string, (result: SharedResult) => void>;

/**
 * Where the page keeps what has already been done.
 *
 * `Symbol.for` rather than a module-level constant, and that is the entire mechanism: two separately
 * built modules on one page have two copies of this file, so a module-scoped map would give each of
 * them their own and share nothing. The registry symbol is the one thing they can agree on without
 * importing each other.
 *
 * **Versioned**, because the agreement is about the shape of what is stored. A future version that
 * changes {@link SharedResult} takes a new symbol and simply does not share with the old one, which
 * is the right outcome: not sharing is slower, and sharing something misread is wrong.
 */
const REGISTRY_KEY = Symbol.for('antumbra.page-scope.v1');
const SETTLERS_KEY = Symbol.for('antumbra.page-scope.settlers.v1');

type GlobalWithRegistry = typeof globalThis & {
  [REGISTRY_KEY]?: Registry | undefined;
  [SETTLERS_KEY]?: Settlers | undefined;
};

// `globalThis` is the untyped boundary this file is built on: nothing can describe what another
// module put there, so the shape is asserted once, here, and checked nowhere else.
const globals = globalThis as GlobalWithRegistry;

function registry(): Registry {
  const existing = globals[REGISTRY_KEY];
  if (existing !== undefined) {
    return existing;
  }
  const created: Registry = new Map();
  globals[REGISTRY_KEY] = created;
  return created;
}

function settlers(): Settlers {
  const existing = globals[SETTLERS_KEY];
  if (existing !== undefined) {
    return existing;
  }
  const created: Settlers = new Map();
  globals[SETTLERS_KEY] = created;
  return created;
}

/**
 * Claim a page-scoped step, or find that somebody already has.
 *
 * **Synchronous, and that is what makes it a lock.** Two bootstraps reaching the same level in the
 * same tick both call this; the first one to arrive registers a promise nobody has resolved yet, and
 * the second one gets it. An `await` anywhere before the registration would open a window where both
 * decide they own it.
 */
export function claimPageStep(key: string): Claim {
  const existing = registry().get(key);
  if (existing !== undefined) {
    return { owned: false, result: existing };
  }

  let settle: (result: SharedResult) => void = () => {
    return undefined;
  };
  const result = new Promise<SharedResult>((resolve) => {
    settle = resolve;
  });
  registry().set(key, result);
  settlers().set(key, settle);

  return {
    owned: true,
    settle: (value) => {
      settlers().get(key)?.(value);
      settlers().delete(key);
    },
  };
}

/**
 * Forget everything the page has shared.
 *
 * For tests, and for a demo that boots repeatedly. Not for tagion: a page that clears this
 * between two modules loading is a page that does the work twice, which is the thing this exists to
 * stop.
 */
export function clearPageScope(): void {
  registry().clear();
  settlers().clear();
}
