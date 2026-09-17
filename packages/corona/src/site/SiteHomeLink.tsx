import styles from './SiteHomeLink.module.css';
import { isOnSite } from './on-site.ts';

/**
 * The way out of a playground and back to the site around it.
 *
 * **It renders only when there is a site to return to**, and works that out from where it is being
 * served rather than from configuration. A playground is a standalone build: run on its own it is
 * the whole of what the reader can see, and a link to `/` would take them to the page they are
 * already on. Assembled under `/playground/<capability>/` it is one surface of a larger site, and
 * the way back is the only thing missing from it.
 *
 * A plain anchor, not a router link: the site is a different build, so this leaves the application
 * rather than navigating inside it.
 */
export function SiteHomeLink({ label }: { readonly label: string }) {
  if (!isOnSite()) {
    return null;
  }

  return (
    <a className={styles['link']} href="/">
      <span aria-hidden="true">←</span>
      {label}
    </a>
  );
}
