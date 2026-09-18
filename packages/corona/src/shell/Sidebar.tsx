import { Link, useRouterState } from '@tanstack/react-router';
import { useEffect, type ComponentType } from 'react';

import { SiteLinks, type PlaygroundSlug } from '../site/SiteLinks.tsx';
import styles from './Sidebar.module.css';

/** One route the drawer names. The icon is the host's — an icon set is a voice. */
export type NavItem = {
  readonly path: string;
  readonly label: string;
  readonly icon: ComponentType;
};

export type NavGroup = {
  readonly label: string;
  readonly items: readonly NavItem[];
};

type SidebarProps = {
  /** The grouping and the reading order. The host's information architecture, not this one's. */
  readonly groups: readonly NavGroup[];
  /** Which playground this is, for the way out at the foot. */
  readonly current: PlaygroundSlug;
  readonly isMobile: boolean;
  readonly mobileOpen: boolean;
  readonly onClose: () => void;
};

const NavGroups = ({
  groups,
  currentPath,
  onNavigate,
}: {
  readonly groups: readonly NavGroup[];
  readonly currentPath: string;
  readonly onNavigate: (() => void) | undefined;
}) => {
  return (
    <div className={styles['nav']}>
      {groups.map((group) => {
        return (
          <nav key={group.label} aria-label={group.label}>
            <span className={styles['groupLabel']}>{group.label}</span>
            <ul className={styles['list']}>
              {group.items.map((item) => {
                // Exact, or a whole segment deeper: `/api/$category` stays lit under `/api`, and
                // `/apiary` does not. A bare `startsWith` matches the second.
                const isActive =
                  currentPath === item.path || currentPath.startsWith(`${item.path}/`);
                const Icon = item.icon;

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={onNavigate}
                      aria-current={isActive ? 'page' : undefined}
                      className={[styles['item'], isActive ? styles['itemSelected'] : '']
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <span className={styles['itemIcon']}>
                        <Icon />
                      </span>
                      {/* One weight throughout: 400→600 on select re-measures every glyph, so the
                          label re-spaces under the pointer mid-click. The fill already says which. */}
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
};

/**
 * The navigation drawer, and the same one in every playground.
 *
 * **It was written twice and the two had drifted structurally**, which is not a thing a reader
 * sees until something depends on the shape. One was a full-height flex column with a scrolling
 * nav; the other started below the top bar and scrolled as a block, with no flex at all — so the
 * foot that pins itself to the bottom of the column pinned in one playground and floated in the
 * other two. Measured at 720 and 1400: 0px from the bottom against 163 and 371.
 *
 * The column is what stayed, because it is the shape the pinned foot and the mobile drawer both
 * need. What the host still owns is its routes and its icons.
 */
export function Sidebar({ groups, current, isMobile, mobileOpen, onClose }: SidebarProps) {
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
        {/* A button, not a div with a handler: the backdrop is the click-outside, and a div is not
            reachable by keyboard and has no accessible name. It stays mounted so the fade has
            something to animate, and `pointer-events` is what makes it inert when closed. */}
        <button
          type="button"
          aria-label="Close navigation"
          tabIndex={mobileOpen ? 0 : -1}
          className={[styles['backdrop'], mobileOpen ? styles['backdropOpen'] : '']
            .filter(Boolean)
            .join(' ')}
          onClick={onClose}
        />
        <aside
          className={[
            styles['panel'],
            styles['panelMobile'],
            mobileOpen ? styles['panelMobileOpen'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
          // `inert`, not `aria-hidden`: the closed panel still holds tabbable links, and hiding
          // it from readers while leaving it in the tab order is the worse half of the bug.
          inert={mobileOpen ? undefined : true}
        >
          <div className={styles['toolbarSpacer']} />
          <NavGroups groups={groups} currentPath={currentPath} onNavigate={onClose} />
          <SiteLinks current={current} />
        </aside>
      </>
    );
  }

  return (
    <aside className={styles['placeholder']}>
      <div className={styles['panel']}>
        <div className={styles['toolbarSpacer']} />
        <NavGroups groups={groups} currentPath={currentPath} onNavigate={undefined} />
        <SiteLinks current={current} />
      </div>
    </aside>
  );
}
