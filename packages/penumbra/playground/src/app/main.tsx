import '@/app/styles/app.css';

import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { router } from '@/app/router';

/**
 * One door. The sibling playgrounds have two — the component suite reaches theirs through
 * `?gallery` — and this one has no component suite: what it demonstrates is stylesheets, and the
 * claims about them are held by `check-tokens`, `penumbra-contrast` and `check:mobile`.
 */
const host = document.getElementById('root');
if (host === null) {
  throw new Error('No #root in the page.');
}
createRoot(host).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
