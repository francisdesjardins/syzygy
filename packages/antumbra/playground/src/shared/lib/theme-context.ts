import { createContext, use } from 'react';

export type Scheme = 'light' | 'dark';

export type ThemeValue = {
  readonly scheme: Scheme;
  readonly toggle: () => void;
};

/**
 * The context and its reader, apart from the provider that fills it.
 *
 * A module that exports a component *and* anything else loses fast refresh, so the split is not
 * tidiness: it is what keeps an edit to the provider from reloading the whole page.
 */
export const ThemeContext = createContext<ThemeValue | undefined>(undefined);

export function useTheme(): ThemeValue {
  const value = use(ThemeContext);
  if (value === undefined) {
    throw new Error('useTheme was called outside a <ThemeProvider>.');
  }
  return value;
}
