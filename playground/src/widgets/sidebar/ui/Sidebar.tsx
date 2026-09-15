import { Link, useRouterState } from '@tanstack/react-router';
import { useEffect } from 'react';
import styles from '@/widgets/sidebar/ui/Sidebar.module.css';

type NavItem = { readonly path: string; readonly label: string };
type NavGroup = { readonly label: string; readonly items: readonly NavItem[] };

/** Grouped so the routes read as a path: the idea, then the shapes it takes, then the reference. */
const NAV_GROUPS: readonly NavGroup[] = [
  {
    label: 'Learn',
    items: [
      { path: '/', label: 'Overview' },
      { path: '/getting-started', label: 'One application' },
    ],
  },
  {
    label: 'More than one',
    items: [
      { path: '/microfrontends', label: 'Four fragments' },
      { path: '/single-spa', label: 'With single-spa' },
    ],
  },
  {
    label: 'Reference',
    items: [
      { path: '/design-system', label: 'Design system' },
      { path: '/api', label: 'API' },
    ],
  },
  {
    label: 'Testing',
    items: [{ path: '/stories', label: 'Test harnesses' }],
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

  // A drawer left open across a navigation covers the page the reader just asked for.
  useEffect(() => {
    onClose();
  }, [currentPath, onClose]);

  if (isMobile) {
    return (
      <>
        {mobileOpen ? <div className={styles['scrim']} onClick={onClose} /> : null}
        <aside
          className={`${styles['fixed']} ${styles['drawer']} ${mobileOpen ? styles['drawerOpen'] : ''}`}
          aria-hidden={!mobileOpen}
        >
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
