import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Penumbra, and it is imported before anything that reads it: the three sheets are this site's
// palette outright, and `app.css` below them is the reset and the element defaults.
import 'penumbra/tokens.system.css';
import 'penumbra/tokens.skin.base.css';
import './styles/tokens.skin.css';
import './styles/app.css';

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
