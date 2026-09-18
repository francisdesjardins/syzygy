import { useDocumentTitle } from '@/app/useDocumentTitle';
import { ThemeProvider } from '@/app/providers/ThemeProvider/ThemeProvider';
import { RootLayout } from '@/widgets/root-layout';

/**
 * What surrounds the application.
 *
 * Its own file rather than `router.tsx` because a module that exports a component *and* anything
 * else forces a full reload instead of a fast refresh.
 */
export function AppRoot() {
  useDocumentTitle();

  return (
    <ThemeProvider>
      <RootLayout />
    </ThemeProvider>
  );
}
