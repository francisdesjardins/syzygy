import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { AppIconButton } from './AppIconButton.tsx';
import { MenuIcon } from '../icons/index.ts';
import { ThemeToggleButton } from '../theme/index.ts';
import styles from './TopBar.module.css';

/**
 * The bar every playground wears, and the mark is the only thing about it that is not shared.
 *
 * The three carried a copy each: the same header, toolbar, brand link, wordmark, pill and spacer,
 * differing in one element and one word. What that cost is visible in what was left behind — one
 * copy's stylesheet described the *other* playground's mark, at the other playground's size,
 * because the comment was carried across and the drawing under it was not.
 *
 * `name` is the capitalised one, as {@link PLAYGROUNDS} spells it. It is both the wordmark and the
 * link's label, so the two cannot disagree — one bar said "umbra — home" under a wordmark reading
 * "Umbra".
 */
export function TopBar({
  name,
  mark,
  isMobile,
  onMenuClick,
}: {
  readonly name: string;
  /** The playground's own mark, drawn however it likes, at 26px of room. */
  readonly mark: ReactNode;
  readonly isMobile: boolean;
  readonly onMenuClick: () => void;
}) {
  return (
    <header className={styles['appBar']}>
      <div className={styles['toolbar']}>
        {isMobile ? (
          <AppIconButton
            className={styles['menuButton']}
            onClick={onMenuClick}
            aria-label="Open navigation"
          >
            <MenuIcon />
          </AppIconButton>
        ) : null}
        {/* The brand is the way home — the landing page is the one route not in the sidebar. The
            way out of the playground is at the foot of the drawer, with the rest of the menu. */}
        <Link to="/" aria-label={`${name} — home`} className={styles['brand']}>
          {mark}
          {/* Not an <h1>: the page's own title owns that, and two leave no unique document heading. */}
          <span className={styles['wordmark']}>{name}</span>
          <span className={styles['pill']}>Playground</span>
        </Link>

        <div className={styles['spacer']} />

        <ThemeToggleButton />
      </div>
    </header>
  );
}
