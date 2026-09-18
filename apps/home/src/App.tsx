import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { useEffect } from 'react';
import type { JSX } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useTheme } from './hooks/useTheme';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';

/**
 * One route, imported eagerly.
 *
 * There is nothing to split off it any more: the design-system page moved to penumbra's own
 * playground, taking three token sheets of text with it, and splitting the page a visitor arrives
 * on would buy a second round trip before anything paints.
 *
 * The three playgrounds are separate builds served from `/playground/`, so nothing here routes to
 * them — a link out of this application is how a visitor reaches one.
 */
export function App(): JSX.Element {
  const { theme } = useTheme();
  const { i18n } = useTranslation();

  // Synchronize <html lang> attribute with i18n language
  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <MainLayout>
          {/* No spinner: the chunk is small and local, and a flash of one is worse than the pause
              it reports. */}
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </ThemeProvider>
  );
}
