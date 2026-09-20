import { Outlet, useRouterState } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { PeekingMoon } from '../mascot/index.ts';
import { useTheme } from '../theme/index.ts';
import type { PlaygroundSlug } from '../site/index.ts';
import { Sidebar, type NavGroup } from './Sidebar.tsx';
import { TopBar } from './TopBar.tsx';
import { useMediaQuery } from '../lib/use-media-query.ts';
import styles from './AppShell.module.css';

/** Below the drawer breakpoint. Spelled out, so the layout does not move without the sheet. */
const DRAWER_BREAKPOINT = '(max-width: 899.95px)';

/**
 * The whole chrome: the bar, the drawer, the outlet under them, and the mascot over it.
 *
 * Each playground had its own copy of this, and the copies were the same file — one stylesheet was
 * byte-identical to another, and the third differed by a comment's wording and a transition on a
 * margin nothing ever changed. What a playground actually owns is four things, and they are the
 * four arguments here: its name, its mark, its routes and its moon.
 *
 * Providers stay above this. A shell reaching up for one inverts the layer order, and the next
 * thing that does it will have a reason too.
 */
export function AppShell({
  name,
  mark,
  groups,
  current,
  moon,
  hideMascotOn = ['/'],
  overlay,
}: {
  readonly name: string;
  readonly mark: ReactNode;
  readonly groups: readonly NavGroup[];
  readonly current: PlaygroundSlug;
  /**
   * The playground's own drawing, asked for the scheme rather than handed a node: the shell already
   * reads the theme, and a second reader is a second place to get it wrong.
   */
  readonly moon?: ((isDark: boolean) => ReactNode) | undefined;
  /** Routes the mascot stays off, over and above the landing page every playground hides it on. */
  readonly hideMascotOn?: readonly string[] | undefined;
  /** Rendered inside `<main>` after the outlet — a dialog the layout owns rather than a page. */
  readonly overlay?: ReactNode | undefined;
}) {
  const { scheme } = useTheme();
  const isMobile = useMediaQuery(DRAWER_BREAKPOINT);
  const [mobileOpen, setMobileOpen] = useState(false);

  // The landing page already shows the same drawing full size, so a peeking twin beside it reads as
  // a stray render. A playground with fixtures at the card edges has the same problem on that route.
  const hidesMascot = useRouterState({
    select: (state) => {
      return hideMascotOn.includes(state.location.pathname);
    },
  });

  return (
    <div className={styles['shell']}>
      <TopBar
        name={name}
        mark={mark}
        isMobile={isMobile}
        onMenuClick={() => {
          setMobileOpen((previous) => {
            return !previous;
          });
        }}
      />
      <Sidebar
        groups={groups}
        current={current}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        onClose={() => {
          setMobileOpen(false);
        }}
      />
      <main className={styles['main']}>
        <div className={styles['toolbarSpacer']} />
        <div className={styles['content']}>
          <Outlet />
        </div>
        {overlay}
      </main>
      {/* Last, and under `--app-z-mascot`: that is what keeps it below the chrome and below the
          drawer's backdrop, which is what lets a tap outside close the drawer. */}
      {moon === undefined || hidesMascot ? null : <PeekingMoon moon={moon(scheme === 'dark')} />}
    </div>
  );
}
