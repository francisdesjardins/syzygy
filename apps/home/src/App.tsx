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
 * One route, and the page behind it is imported rather than lazily loaded.
 *
 * Splitting the only page off the entry chunk buys a second round trip before anything paints.
 * The router stays: the playgrounds are separate builds served from `/playground/`, so nothing
 * here routes to them, but this is the door a second page would come through.
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
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </ThemeProvider>
  );
}
