import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { lazy, Suspense, useEffect } from 'react';
import type { JSX } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useTheme } from './hooks/useTheme';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';

/**
 * The landing page is imported eagerly and everything else is split off it.
 *
 * Splitting the page a visitor arrives on buys a second round trip before anything paints, so
 * `Home` stays in the entry chunk. `/design-system` is somewhere they navigate to, and it carries
 * three token sheets as text, which is weight the landing page has no use for.
 *
 * The playgrounds are separate builds served from `/playground/`, so nothing here routes to them —
 * a link out of this application is how a visitor reaches one.
 */
const DesignSystem = lazy(async () => {
  const module = await import('./pages/DesignSystem');
  return { default: module.DesignSystem };
});

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
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/design-system" element={<DesignSystem />} />
            </Routes>
          </Suspense>
        </MainLayout>
      </BrowserRouter>
    </ThemeProvider>
  );
}
