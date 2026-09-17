import { createContext, use, type ReactNode } from 'react';

import type { ApiSlots, ApiEntryPoints } from './contract.ts';

type ApiReferenceValue = {
  readonly slots: ApiSlots;
  readonly entryPoints: ApiEntryPoints;
};

const ApiReferenceContext = createContext<ApiReferenceValue | null>(null);

/**
 * A context rather than props threaded down ten components.
 *
 * The borrowed components are needed four levels deep — the button lives in the member list, the
 * code block in the symbol article — and threading them would put five props on every node in
 * between, most of which pass them straight through. One composition point at the route's edge is
 * the whole cost.
 *
 * Null by default and thrown on rather than defaulted: a viewer rendered without its host's
 * components would otherwise come up blank, which is the kind of failure that reaches a reader
 * before it reaches a test.
 */
export const ApiReferenceProvider = ({
  slots,
  entryPoints,
  children,
}: {
  readonly slots: ApiSlots;
  readonly entryPoints: ApiEntryPoints;
  readonly children: ReactNode;
}) => {
  return <ApiReferenceContext value={{ slots, entryPoints }}>{children}</ApiReferenceContext>;
};

const useApiReference = (): ApiReferenceValue => {
  const value = use(ApiReferenceContext);
  if (value === null) {
    throw new Error('The API reference was rendered outside a <ApiReferenceProvider>.');
  }
  return value;
};

/** The host's components, for a viewer that renders through them rather than owning them. */
export const useSlots = (): ApiSlots => {
  return useApiReference().slots;
};

/** The documented library's own entry points — the only library-specific data the viewer holds. */
export const useEntryPoints = (): ApiEntryPoints => {
  return useApiReference().entryPoints;
};
