import { createStore, type CreateStoreOptions, type Store, type StoreApi } from 'antumbra/react';
import { produce } from '@/shared/lib/draft';

// The "extend the builder" pattern: the library offers `set`/`reset`, and the builder's `api` is
// where a project adds what it wants on top — here an `update` that runs `draft.ts` beside it.

/** Builder API extended with a draft-mutating `update`. */
export type DraftStoreApi<TSnapshot, TContext = never> = StoreApi<TSnapshot, TContext> & {
  /** Draft mutation — `update((d) => { d.a.b = 1 })`. */
  readonly update: (recipe: (draft: TSnapshot) => void) => void;
};

/** Like `createStore(initial, { builder })`, but the builder also gets `update(recipe)`. */
export function createDraftStore<
  TSnapshot extends object,
  TMethods extends Record<string, unknown>,
  TContext = never,
>(
  initialSnapshot: TSnapshot,
  options: CreateStoreOptions<TSnapshot, TContext> & {
    readonly builder: (api: DraftStoreApi<TSnapshot, TContext>) => TMethods;
  }
): Store<TSnapshot, TMethods> {
  const { builder, ...rest } = options;
  return createStore<TSnapshot, TMethods, TContext>(initialSnapshot, {
    ...rest,
    builder: (api) => {
      return builder({
        ...api,
        update: (recipe) => {
          api.set((snapshot) => {
            return produce(snapshot, recipe);
          });
        },
      });
    },
  });
}
