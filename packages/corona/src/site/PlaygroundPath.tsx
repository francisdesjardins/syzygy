import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';

import styles from './PlaygroundPath.module.css';
import { isOnSite } from './on-site.ts';

/**
 * The three playgrounds, and the only place their names are written.
 *
 * **A slug is a capability; a name is a package.** The two are kept apart on purpose: a package is
 * renamed the day a better word turns up, and a deployed URL that followed it would break every
 * link anybody kept. `deploy.mjs` says the same thing from the other end — the playgrounds are
 * served by what they demonstrate, "whatever the packages end up being called".
 */
const PLAYGROUNDS = [
  { slug: 'dialog', name: 'Antumbra' },
  { slug: 'boot', name: 'Umbra' },
] as const;

export type PlaygroundSlug = (typeof PLAYGROUNDS)[number]['slug'];

type PlaygroundPathProps = {
  /** Which of the three this shell is. The slug, not the name — see `PLAYGROUNDS`. */
  readonly current: PlaygroundSlug;
  /**
   * The current playground's own mark, rendered inside its segment. The drawing stays with the
   * project: an eclipse and an annular ring are not the same picture, and neither is corona's.
   */
  readonly mark?: ReactNode | undefined;
  /**
   * `bar` collapses to the current segment alone below the drawer breakpoint, where the row cannot
   * shrink; `footer` always shows the whole path, having a line of its own to wrap onto.
   */
  readonly variant?: 'bar' | 'footer' | undefined;
};

/**
 * Where you are, and the way to the other two.
 *
 * **It never renders nothing.** Off the site — a playground opened on its own, which is how it is
 * developed — there is no `/` and no sibling to reach, so the same path renders as plain text. A
 * component that disappeared in `yarn dev` would be invisible for the whole of the work that
 * changes it, and the one thing a reader would meet first is the one nobody could see.
 */
export function PlaygroundPath({ current, mark, variant = 'bar' }: PlaygroundPathProps) {
  const onSite = isOnSite();

  return (
    <nav
      className={[styles['path'], styles[variant]].join(' ')}
      aria-label="Playgrounds"
      data-offsite={onSite ? undefined : ''}
    >
      {onSite ? (
        <a className={styles['up']} href="/">
          Home
        </a>
      ) : (
        <span className={styles['up']}>Home</span>
      )}
      <span className={styles['sep']} aria-hidden="true">
        /
      </span>
      <span className={styles['section']}>playground</span>
      <span className={styles['sep']} aria-hidden="true">
        /
      </span>

      {PLAYGROUNDS.map((playground) => {
        if (playground.slug === current) {
          return (
            // To this playground's own landing page, which is the one route its sidebar omits.
            <Link key={playground.slug} to="/" className={styles['current']} aria-current="true">
              {mark}
              <span className={styles['name']}>{playground.name}</span>
            </Link>
          );
        }
        if (!onSite) {
          return (
            <span key={playground.slug} className={styles['sibling']}>
              {playground.name}
            </span>
          );
        }
        return (
          // A plain anchor: a sibling is a different build, so this leaves the application.
          <a
            key={playground.slug}
            className={styles['sibling']}
            href={`/playground/${playground.slug}/`}
          >
            {playground.name}
          </a>
        );
      })}
    </nav>
  );
}
