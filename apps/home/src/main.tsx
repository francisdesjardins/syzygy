import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';

// Penumbra. The system half is the package now, not a copy of it; the skin beside it is this
// site's own and sets typefaces only — colour stays in the MUI palette.
import 'penumbra/tokens.system.css';
import './styles/tokens.skin.css';

import './i18n';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
