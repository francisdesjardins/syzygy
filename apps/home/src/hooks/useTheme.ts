import { createTheme as createMuiTheme } from '@mui/material/styles';
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
 * `:root[data-color-scheme='dark']`, so setting this is what switches the whole palette — and it
 * has to happen before the theme is read, since the theme is read *from* the palette.
 */
const applyScheme = (dark: boolean): void => {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset['colorScheme'] = dark ? 'dark' : 'light';
  }
};

/**
 * One value, read from where it is declared.
 *
 * `src/styles/tokens.skin.css` and penumbra's two sheets are the palette; this is MUI being told
 * what it is rather than being given a second copy. A component asking for `primary.main` and a
 * stylesheet asking for `var(--app-primary)` cannot disagree, which they did for as long as the
 * hexadecimal lived in both.
 *
 * The fallback is for a document that has not parsed the sheets — a test renderer, a server. It is
 * deliberately wrong-looking rather than plausible: a theme built on it is a bug to see, not a
 * palette to ship.
 */
const token = (name: string): string => {
  if (typeof document === 'undefined') {
    return '#ff00ff';
  }
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#ff00ff';
};

const createTheme = (dark: boolean) => {
  applyScheme(dark);

  return createMuiTheme({
    palette: {
      mode: dark ? 'dark' : 'light',
      // `main` and `dark` only; MUI derives `light` from `main`, and nothing on this site asks for
      // it. `dark` is what a contained button hovers to, which is the token's whole job.
      primary: {
        main: token('--app-primary'),
        dark: token('--app-primary-hover'),
        contrastText: token('--app-primary-ink'),
      },
      // The ring: the hue this site's fuchsia was deepened from, kept for what is never text.
      secondary: { main: token('--app-ring') },
      background: {
        default: token('--app-bg'),
        paper: token('--app-paper'),
      },
      text: {
        primary: token('--app-text'),
        secondary: token('--app-text-secondary'),
        disabled: token('--app-text-tertiary'),
      },
      divider: token('--app-divider'),
      error: {
        main: token('--app-error'),
        dark: token('--app-error-hover'),
        contrastText: token('--app-error-ink'),
      },
      success: { main: token('--app-ok') },
      info: { main: token('--app-info') },
      warning: { main: token('--app-warn') },
      action: {
        hover: token('--app-hover'),
        selected: token('--app-selected'),
      },
    },
    // Penumbra, system half. These mirror the handful of values MUI wants as JS rather than as a
    // custom property.
    //
    // `spacing` is deliberately left at MUI's 8px default: its steps (8/16/24/32) are already
    // points on the token file's 4px grid, so rebasing it to 4 would halve every gap on the site
    // to buy nothing.
    shape: {
      borderRadius: 8, // --app-radius-md
    },
    transitions: {
      duration: {
        shortest: 110, // --app-quick
        shorter: 110,
        short: 200, // --app-duration
        standard: 200,
        complex: 340, // --app-slow
        enteringScreen: 200,
        leavingScreen: 200,
      },
      easing: {
        easeInOut: 'cubic-bezier(0.2, 0, 0, 1)', // --app-ease
        easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)', // --app-ease-out
        easeIn: 'cubic-bezier(0.7, 0, 0.84, 0)', // --app-ease-in
        sharp: 'cubic-bezier(0.2, 0, 0, 1)',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*::-webkit-scrollbar': { width: '8px', height: '8px' },
          '*::-webkit-scrollbar-track': { background: 'var(--app-scrollbar-track)' },
          '*::-webkit-scrollbar-thumb': {
            background: 'var(--app-scrollbar-thumb)',
            borderRadius: '4px',
          },
        },
      },
    },
  });
};

// Static theme instance
let theme = createTheme(isDark);

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
    theme = createTheme(isDark);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(isDark));
    setIsDarkMode(isDark);
    window.dispatchEvent(new CustomEvent(THEME_UPDATE, { detail: isDark }));
  }, []);

  return { theme, isDarkMode, toggle };
};
