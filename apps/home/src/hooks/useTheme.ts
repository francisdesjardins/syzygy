import { useCallback, useState, useEffect } from 'react';

const STORAGE_KEY = 'theme-preference';
const THEME_UPDATE = 'theme-update';

type ThemeUpdateEvent = CustomEvent<boolean>;

declare global {
  interface WindowEventMap {
    [THEME_UPDATE]: ThemeUpdateEvent;
  }
}

let isDark: boolean = false;
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      isDark = Boolean(JSON.parse(saved));
    }
  } catch {
    isDark = false;
  }
}

/**
 * The attribute the token sheets answer to. Penumbra's dark block is
 * `:root[data-color-scheme='dark']`, so setting this is the whole of switching the palette.
 */
const applyScheme = (dark: boolean): void => {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset['colorScheme'] = dark ? 'dark' : 'light';
  }
};

// At module scope, not from an effect: this runs before React's first render, and an attribute
// written afterwards paints the other scheme for a frame. It used to ride along inside the MUI
// theme builder, which is a thing to depend on that nobody would look for — and did not survive
// that builder being deleted.
applyScheme(isDark);

export const useTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(isDark);

  useEffect(() => {
    const handleUpdate = (e: ThemeUpdateEvent): void => {
      setIsDarkMode(e.detail);
    };

    window.addEventListener(THEME_UPDATE, handleUpdate);
    return () => {
      window.removeEventListener(THEME_UPDATE, handleUpdate);
    };
  }, []);

  const toggle = useCallback((): void => {
    isDark = !isDark;
    applyScheme(isDark);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(isDark));
    setIsDarkMode(isDark);
    window.dispatchEvent(new CustomEvent(THEME_UPDATE, { detail: isDark }));
  }, []);

  return { isDarkMode, toggle };
};
