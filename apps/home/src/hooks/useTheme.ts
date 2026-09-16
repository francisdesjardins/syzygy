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

// Helper to create theme
const createTheme = (isDark: boolean) => {
  const scrollbarColors = {
    track: isDark ? '#2d2d2d' : '#f1f1f1',
    thumb: isDark ? '#666' : '#888',
    thumbHover: isDark ? '#808080' : '#555',
  };

  return createMuiTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: isDark
        ? {
            main: '#FF8BC4', // Lighter hot pink for dark mode — better legibility on dark backgrounds
            light: '#FFAED5',
            dark: '#FF69B4',
            contrastText: '#fff',
          }
        : {
            // Deepened from #FF69B4, which measured 2.65:1 on white — below the 3:1 floor for
            // large text, so the h1, every link and white-on-pink buttons all failed WCAG 1.4.3.
            // This is the same fuchsia at 5.11:1. The original stays available as `light`.
            main: '#C13584',
            light: '#FF69B4',
            dark: '#9D2A6B',
            contrastText: '#fff',
          },
      // White card on a white page gave the layout nothing to sit on. In light mode the ground is
      // knocked back to a near-neutral carrying a trace of the brand fuchsia — 1.13:1 against the
      // paper, enough to read as a surface without becoming a colour of its own. Paper stays pure
      // white, so every contrast ratio measured against it still holds. Dark mode keeps the
      // defaults, which already separate.
      ...(isDark
        ? {}
        : {
            background: {
              default: '#F4F0F2',
              paper: '#FFFFFF',
            },
          }),
      secondary: {
        main: '#9C27B0', // Purple to complement fuschia
        light: '#BA68C8',
        dark: '#7B1FA2',
        contrastText: '#fff',
      },
    },
    // Penumbra, system half. `src/styles/tokens.system.css` is the source of truth; these mirror
    // the handful of values MUI wants as JS rather than as a custom property.
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
          '*::-webkit-scrollbar-track': { background: scrollbarColors.track },
          '*::-webkit-scrollbar-thumb': {
            background: scrollbarColors.thumb,
            borderRadius: '4px',
            '&:hover': { background: scrollbarColors.thumbHover },
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
