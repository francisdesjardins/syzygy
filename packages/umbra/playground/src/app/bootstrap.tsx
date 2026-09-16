import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { router } from '@/app/router';

/**
 * Render the demo.
 *
 * Its own module so `main.tsx` can reach it with a dynamic import: the component suite's `?gallery`
 * door must not pull the router in, and a static import at the top of `main.tsx` loads the whole app
 * graph whether or not the branch below it runs.
 */
export function bootstrap(): void {
  const host = document.getElementById('root');
  if (host === null) {
    throw new Error('No #root in the page.');
  }
  createRoot(host).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
}
