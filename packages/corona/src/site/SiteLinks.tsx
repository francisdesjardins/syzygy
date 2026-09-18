import type { ReactNode } from 'react';

import styles from './SiteLinks.module.css';
import { AntumbraMark, HouseMark, PenumbraMark, UmbraMark } from './marks.tsx';
import { isOnSite } from './on-site.ts';

/**
 * The playgrounds, by the slug each is deployed under, and the only place they are named.
 *
 * **A slug is a capability; a name is a package.** The two are kept apart on purpose: a package is
 * renamed the day a better word turns up, and a deployed URL that followed it would break every
 * link anybody kept. `deploy.mjs` says the same thing from the other end — the playgrounds are
 * served by what they demonstrate, "whatever the packages end up being called".
 */
const PLAYGROUNDS = [
  { slug: 'dialog', name: 'Antumbra', mark: <AntumbraMark /> },
  { slug: 'boot', name: 'Umbra', mark: <UmbraMark /> },
  { slug: 'design', name: 'Penumbra', mark: <PenumbraMark /> },
] as const;

export type PlaygroundSlug = (typeof PLAYGROUNDS)[number]['slug'];

type SiteLinksProps = {
  /** Which of these this shell is, so it is not offered as somewhere to go. */
  readonly current: PlaygroundSlug;
};

const Row = ({
  href,
  name,
  mark,
}: {
  readonly href: string | undefined;
  readonly name: string;
  readonly mark: ReactNode;
}) => {
  // Off the site there is nowhere to go, so nothing may look like it leads anywhere.
  if (href === undefined) {
    return (
      <li className={styles['cell']}>
        <span className={styles['mark']} title={name}>
          {mark}
          <span className={styles['name']}>{name}</span>
        </span>
      </li>
    );
  }
  return (
    <li className={styles['cell']}>
      {/* A plain anchor: each of these is a different build, so it leaves the application. */}
      <a className={styles['mark']} href={href} title={name}>
        {mark}
        <span className={styles['name']}>{name}</span>
      </a>
    </li>
  );
};

/**
 * The way out, at the foot of the navigation drawer — one row of marks rather than a labelled list.
 *
 * It sits with the rest of the menu because that is where a reader looks for navigation, and the
 * top bar has no room to spare: nothing in that row can shrink, so the longest item in it decides
 * whether the theme toggle stays on screen at 360px.
 *
 * **Glyphs, not words.** A stack of named rows cost the drawer about 130px of its height for three
 * links, and "Home" is a flat word to meet between Antumbra and Umbra. The marks say it in 58px:
 * a house everyone already knows, and the three shadow regions the three packages are named after,
 * which is the one place that naming explains itself. Each carries its name for a reader who cannot
 * see it, and shows it on hover for one who can.
 */
export function SiteLinks({ current }: SiteLinksProps) {
  const onSite = isOnSite();
  const elsewhere = PLAYGROUNDS.filter((playground) => {
    return playground.slug !== current;
  });

  return (
    <nav className={styles['links']} aria-label="Elsewhere" data-offsite={onSite ? undefined : ''}>
      <ul className={styles['row']}>
        <Row href={onSite ? '/' : undefined} name="Home" mark={<HouseMark />} />
        {elsewhere.map((playground) => {
          return (
            <Row
              key={playground.slug}
              href={onSite ? `/playground/${playground.slug}/` : undefined}
              name={playground.name}
              mark={playground.mark}
            />
          );
        })}
      </ul>
    </nav>
  );
}
