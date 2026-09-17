import { createContext, use, type ReactNode } from 'react';

import type { TokenSlots } from './contract.ts';

type TokenTablesValue = {
  readonly slots: TokenSlots;
};

const TokenTablesContext = createContext<TokenTablesValue | null>(null);

/**
 * One composition point at the route's edge, the way the API viewer takes its host's components.
 *
 * Null by default and thrown on rather than defaulted: tables rendered without a card would come up
 * as bare rows on the page ground, which is the kind of failure that reaches a reader before it
 * reaches a test.
 */
export const TokenTablesProvider = ({
  slots,
  children,
}: {
  readonly slots: TokenSlots;
  readonly children: ReactNode;
}) => {
  return <TokenTablesContext value={{ slots }}>{children}</TokenTablesContext>;
};

export const useTokenTables = (): TokenTablesValue => {
  const value = use(TokenTablesContext);
  if (value === null) {
    throw new Error('A token table was rendered outside a <TokenTablesProvider>.');
  }
  return value;
};
