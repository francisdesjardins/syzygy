import { useEffect } from 'react';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';

import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';

/**
 * One page, and no router over it.
 *
 * There was a `BrowserRouter` around a single `<Route path="/">`, which did two things: it cost a
 * routing library, and it rendered **nothing** for every other path. The host falls everything
 * through to this document with a 200 — `public/_redirects` ends `/* /index.html 200` — so a stale
 * link, a typo or a crawler following either was answered with a blank white page that claimed to
 * be fine. Measured against arbitrary paths this site has never had: zero characters rendered.
 *
 * The three playgrounds are separate builds served from `/playground/`, so nothing here routes to
 * them — a link out of this application is how a visitor reaches one.
 */
export function App(): JSX.Element {
  const { i18n } = useTranslation();

  // The document's language follows the one the switch chose, so a screen reader and a translator
  // read the page in the language it is actually written in.
  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <MainLayout>
      <Home />
    </MainLayout>
  );
}
