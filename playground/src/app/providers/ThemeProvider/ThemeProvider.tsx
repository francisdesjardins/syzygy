import { type ReactNode, useEffect, useState } from 'react';
import { type Scheme, ThemeContext } from '@/shared/lib/theme-context';

const STORAGE_KEY = 'antumbra:color-scheme';

function preferred(): Scheme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // A private window can refuse storage outright; the media query still answers.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * The colour scheme, written onto the root element rather than passed down.
 *
 * `data-color-scheme` is what the skin keys on, so every token follows from one attribute and no
 * component branches on the mode.
 *
 * Read in the initialiser rather than from an effect: there is no server render here, and setting
 * state from an effect on mount is a second render for a value that was knowable in the first.
 */
export function ThemeProvider({ children }: { readonly children: ReactNode }) {
  const [scheme, setScheme] = useState<Scheme>(preferred);

  useEffect(() => {
    document.documentElement.dataset['colorScheme'] = scheme;
    try {
      localStorage.setItem(STORAGE_KEY, scheme);
    } catch {
      // See above: refusing to remember is not a reason to refuse to render.
    }
  }, [scheme]);

  return (
    <ThemeContext
      value={{
        scheme,
        toggle: () => {
          setScheme((previous) => {
            return previous === 'dark' ? 'light' : 'dark';
          });
        },
      }}
    >
      {children}
    </ThemeContext>
  );
}
