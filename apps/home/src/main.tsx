import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Penumbra, and it is imported before anything that reads it. The three sheets are this site's
// palette outright — `useTheme` builds the MUI theme by resolving these names — so a module that
// evaluated first would build a theme out of values the document did not have yet.
import 'penumbra/tokens.system.css';
import 'penumbra/tokens.skin.base.css';
import './styles/tokens.skin.css';

import { App } from './App';

import './i18n';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
