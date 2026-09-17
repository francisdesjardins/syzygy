import { Link, useRouterState } from '@tanstack/react-router';
import styles from './SectionNav.module.css';

/**
 * A sticky jump bar for long pages.
 *
 * The chips navigate through the router rather than a bare `href="#id"`, and that is not a
 * preference: under the hash-router build — the one that ships to a host with no rewrite — the whole
 * of what follows `#` is the *route*, so `#steps` would replace `#/getting-started` and land on the
 * index. Given both halves the router emits `#/getting-started` plus `#steps` and scrolls.
 */
export function SectionNav({
  sections,
}: {
  readonly sections: readonly { readonly id: string; readonly label: string }[];
}) {
  const pathname = useRouterState({
    select: (state) => {
      return state.location.pathname;
    },
  });

  return (
    <nav aria-label="Jump to section" className={styles['nav']}>
      {sections.map((section) => {
        return (
          <Link key={section.id} to={pathname} hash={section.id} className={styles['chip']}>
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}
