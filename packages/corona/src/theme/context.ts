import { createContext, use } from 'react';

export type Scheme = 'light' | 'dark';

export type ThemeValue = {
  readonly scheme: Scheme;
  readonly toggle: () => void;
};

/**
 * The context and its reader, apart from the provider that fills it.
 *
 * **The provider stays with each playground**, because they do not agree on what else it does:
 * antumbra's also feeds a template token set and writes from a layout effect, umbra's does not.
 * What every one of them has is this — one attribute on the root element, and a hook to read it —
 * so a shell component like the theme toggle can be written once.
 *
 * A module that exports a component *and* anything else loses fast refresh, which is why the
 * context is not in the same file as anything that renders.
 */
export const ThemeContext = createContext<ThemeValue | undefined>(undefined);

export function useTheme(): ThemeValue {
  const value = use(ThemeContext);
  if (value === undefined) {
    throw new Error('useTheme was called outside a <ThemeProvider>.');
  }
  return value;
}
