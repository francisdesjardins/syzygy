import { createStore, type CreateStoreOptions, type Store, type StoreApi } from 'antumbra/react';
import { produce, type Draft } from 'immer';

// The "bring your own immer" pattern: the library's `createStore` offers only `set`/`reset`, and
// this adds a draft-mutation `update`. immer is the playground's, never antumbra's — six example
// files build a store with it, so it is a real dependency here and absent from what the library
// ships.

/** Builder API extended with an immer-backed `update`. */
export type ImmerStoreApi<TSnapshot, TContext = never> = StoreApi<TSnapshot, TContext> & {
  /** Draft mutation via immer — `update((d) => { d.a.b = 1 })`. */
  readonly update: (recipe: (draft: Draft<TSnapshot>) => void) => void;
};

/** Like `createStore(initial, { builder })`, but the builder also gets `update(recipe)`. */
export function createImmerStore<
  TSnapshot,
  TMethods extends Record<string, unknown>,
  TContext = never,
>(
  initialSnapshot: TSnapshot,
  options: CreateStoreOptions<TSnapshot, TContext> & {
    readonly builder: (api: ImmerStoreApi<TSnapshot, TContext>) => TMethods;
  }
): Store<TSnapshot, TMethods> {
  const { builder, ...rest } = options;
  return createStore<TSnapshot, TMethods, TContext>(initialSnapshot, {
    ...rest,
    builder: (api) => {
      return builder({
        ...api,
        update: (recipe) => {
          api.set((s) => {
            return produce(s, recipe);
          });
        },
      });
    },
  });
}
