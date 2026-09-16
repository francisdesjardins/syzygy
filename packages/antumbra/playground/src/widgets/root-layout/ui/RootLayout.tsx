import { useRouterState } from '@tanstack/react-router';
import { PeekingMoon } from '@/shared/ui/PeekingMoon';
import { Outlet } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useCodePane } from '@/shared/lib/code-pane-context';
import { useMediaQuery } from '@/shared/lib/use-media-query';
import { useCodeDialog } from '@/widgets/code-viewer';
import { Sidebar } from '@/widgets/sidebar';
import { TopBar } from '@/widgets/top-bar';
import styles from '@/widgets/root-layout/ui/RootLayout.module.css';

function MainContent() {
  const codeDialog = useCodeDialog();
  const { setOpen } = useCodePane();

  // `open` keeps a stable identity, so it works as a dependency directly — which is what lets this
  // register once rather than on every render.
  const { open } = codeDialog;
  useEffect(() => {
    setOpen(open);
    return () => {
      setOpen(null);
    };
  }, [open, setOpen]);

  return (
    <main className={styles['main']}>
      <div className={styles['toolbarSpacer']} />
      <div className={styles['content']}>
        <Outlet />
      </div>
      {codeDialog.Dialog}
    </main>
  );
}

/**
 * The shell, and nothing above it.
 *
 * Providers are `AppRoot`'s job: a widget reaching up into `app` for them inverts the layer order,
 * and the next widget that does it has a reason too.
 */
export function RootLayout() {
  // Two routes, umbra's two reasons: `/` already shows the same drawing full size in the hero, so
  // a peeking twin beside it reads as a stray render; `/stories` renders fixtures at the card
  // edges, where a mascot wandering among them reads as one of them misbehaving.
  const hidesMascot = useRouterState({
    select: (state) => {
      return state.location.pathname === '/' || state.location.pathname === '/stories';
    },
  });

  // Below 900px — spelled out rather than read from a token, because a media query resolves before
  // the cascade and cannot see a custom property.
  const isMobile = useMediaQuery('(max-width: 899.95px)');
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={styles['shell']}>
      <TopBar
        isMobile={isMobile}
        onMenuClick={() => {
          setMobileOpen((previous) => {
            return !previous;
          });
        }}
      />
      <Sidebar
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        onClose={() => {
          setMobileOpen(false);
        }}
      />
      <MainContent />
      {/* Below the top bar's z-index, so it never covers the chrome. */}
      {!hidesMascot && <PeekingMoon />}
    </div>
  );
}
