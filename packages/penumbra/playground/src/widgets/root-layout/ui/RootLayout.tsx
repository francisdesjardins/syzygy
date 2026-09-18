import { PeekingMoon } from 'corona/mascot';
import { useTheme } from 'corona/theme';
import { Outlet, useRouterState } from '@tanstack/react-router';
import { useState } from 'react';

import { PenumbraMoon } from '@/shared/ui/PenumbraMoon';
import { useMediaQuery } from '@/shared/lib/use-media-query';
import { Sidebar } from '@/widgets/sidebar';
import { TopBar } from '@/widgets/top-bar';
import styles from '@/widgets/root-layout/ui/RootLayout.module.css';

const MainContent = () => {
  return (
    <main className={styles['main']}>
      <div className={styles['toolbarSpacer']} />
      <div className={styles['content']}>
        <Outlet />
      </div>
    </main>
  );
};

const ResponsiveShell = () => {
  // Below the drawer breakpoint — spelled out, so the layout does not move without the sheet.
  const isMobile = useMediaQuery('(max-width: 899.95px)');
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleSidebar = () => {
    setMobileOpen((prev) => {
      return !prev;
    });
  };

  const handleCloseSidebar = () => {
    setMobileOpen(false);
  };

  return (
    <div className={styles['shell']}>
      <TopBar isMobile={isMobile} onMenuClick={handleToggleSidebar} />
      <Sidebar isMobile={isMobile} mobileOpen={mobileOpen} onClose={handleCloseSidebar} />
      <MainContent />
    </div>
  );
};

/**
 * The shell, and nothing above it: providers are `AppRoot`'s job.
 */
export function RootLayout() {
  const { scheme } = useTheme();

  // The landing page already shows the same moon still, so a peeking twin beside it reads as a
  // stray render — the sibling playgrounds suppress theirs on the same route for the same reason.
  const hidesMascot = useRouterState({
    select: (state) => {
      return state.location.pathname === '/';
    },
  });

  return (
    <>
      <ResponsiveShell />
      {/* Rendered last, so `--app-z-mascot` is what keeps it under the shell rather than document
          order — and under the drawer's backdrop, which is what lets a tap outside close it. */}
      {!hidesMascot && <PeekingMoon moon={<PenumbraMoon isDark={scheme === 'dark'} />} />}
    </>
  );
}
