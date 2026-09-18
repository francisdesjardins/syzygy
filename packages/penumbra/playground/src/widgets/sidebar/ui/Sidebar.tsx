import { NAV_GROUPS } from '@/widgets/sidebar/model/nav';
import { SiteLinks } from 'corona/site';
import { Link, useRouterState } from '@tanstack/react-router';
import { useEffect } from 'react';
import styles from '@/widgets/sidebar/ui/Sidebar.module.css';

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
          <SiteLinks current="design" />
        </aside>
      </>
    );
  }

  return (
    <div className={styles['sidebar']}>
      <aside className={styles['fixed']}>
        <NavGroups currentPath={currentPath} onNavigate={undefined} />
        <SiteLinks current="design" />
      </aside>
    </div>
  );
}
