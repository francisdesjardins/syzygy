import type { ComponentType, SVGProps } from 'react';
import {
  HubIcon,
  MenuBookIcon,
  PaletteIcon,
  PlayArrowIcon,
  ScienceIcon,
  WidgetsIcon,
} from '@/shared/ui/icons';
import { Link, useRouterState } from '@tanstack/react-router';
import { useEffect } from 'react';
import styles from '@/widgets/sidebar/ui/Sidebar.module.css';

type NavItem = {
  readonly path: string;
  readonly label: string;
  /** One glyph per destination, as umbra's sidebar carries — a list of words alone reads as prose. */
  readonly icon: ComponentType<SVGProps<SVGSVGElement>>;
};
type NavGroup = { readonly label: string; readonly items: readonly NavItem[] };

/**
 * Grouped so the routes read as a path: the idea, then the shapes it takes, then the reference.
 *
 * The same four groups umbra's sidebar carries, in the same order and the same casing — a reader
 * who knows one playground should not have to re-learn the other's menu. `/` is deliberately
 * absent: the brand in the top bar is the way home, and listing it here would be two controls for
 * one route.
 */
const NAV_GROUPS: readonly NavGroup[] = [
  {
    label: 'Learn',
    items: [{ path: '/getting-started', label: 'One Application', icon: PlayArrowIcon }],
  },
  {
    label: 'Patterns',
    items: [
      { path: '/microfrontends', label: 'Four Fragments', icon: HubIcon },
      { path: '/single-spa', label: 'With single-spa', icon: WidgetsIcon },
    ],
  },
  {
    label: 'Reference',
    items: [
      { path: '/design-system', label: 'Design System', icon: PaletteIcon },
      { path: '/api', label: 'API Reference', icon: MenuBookIcon },
    ],
  },
  {
    label: 'Testing',
    items: [{ path: '/stories', label: 'Test Harnesses', icon: ScienceIcon }],
  },
];

function NavGroups({
  currentPath,
  onNavigate,
}: {
  readonly currentPath: string;
  readonly onNavigate: (() => void) | undefined;
}) {
  return (
    <div className={styles['nav']}>
      {NAV_GROUPS.map((group) => {
        return (
          <nav key={group.label} aria-label={group.label}>
            <span className={styles['groupLabel']}>{group.label}</span>
            <ul className={styles['list']}>
              {group.items.map((item) => {
                // Exact for the index, prefix for the rest: `/` is a prefix of everything.
                const current =
                  item.path === '/' ? currentPath === '/' : currentPath.startsWith(item.path);
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`${styles['item']} ${current ? styles['current'] : ''}`}
                      aria-current={current ? 'page' : undefined}
                      onClick={onNavigate}
                    >
                      <span className={styles['icon']}>
                        <item.icon />
                      </span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        );
      })}
    </div>
  );
}

export function Sidebar({
  isMobile,
  mobileOpen,
  onClose,
}: {
  readonly isMobile: boolean;
  readonly mobileOpen: boolean;
  readonly onClose: () => void;
}) {
  const currentPath = useRouterState({
    select: (state) => {
      return state.location.pathname;
    },
  });

  /*
   * Escape closes the overlay, and nothing else here closes anything.
   *
   * There used to be an effect that called `onClose()` whenever `currentPath` *or* `onClose`
   * changed — and `onClose` is an inline arrow from the shell, so its identity changed on every
   * render. Opening the drawer re-rendered the shell, which handed this a new `onClose`, which ran
   * it, which closed the drawer again: the mobile menu could never open. Navigation already closes
   * it through `onNavigate` on the links below, which is where that belongs.
   */
  useEffect(() => {
    if (!isMobile || !mobileOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isMobile, mobileOpen, onClose]);

  if (isMobile) {
    return (
      <>
        {mobileOpen ? <div className={styles['scrim']} onClick={onClose} /> : null}
        <aside
          className={`${styles['fixed']} ${styles['drawer']} ${mobileOpen ? styles['drawerOpen'] : ''}`}
          // `inert`, not `aria-hidden`: the closed panel still holds tabbable links, and hiding it
          // from readers while leaving it in the tab order is the worse half of the bug. `inert`
          // does both, so the pair cannot drift apart.
          inert={mobileOpen ? undefined : true}
        >
          {/* The drawer runs the full height, so without this its first item sits under the bar. */}
          <div className={styles['toolbarSpacer']} />
          <NavGroups currentPath={currentPath} onNavigate={onClose} />
        </aside>
      </>
    );
  }

  return (
    <div className={styles['sidebar']}>
      <aside className={styles['fixed']}>
        <NavGroups currentPath={currentPath} onNavigate={undefined} />
      </aside>
    </div>
  );
}
