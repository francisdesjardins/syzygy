import type { ReactNode } from 'react';
import styles from './SurfaceCard.module.css';

/**
 * The one card surface, on all three playgrounds.
 *
 * Example cards, story cards and template rows are the same object at three sizes, and each
 * re-declaring the border, dark-mode background and hover lift is how they diverged inside one
 * playground. They then diverged again *between* playgrounds: two of the three carried a plainer
 * card with no argument written for it, while this one's every choice has a reason beside it — so
 * this is the one that stayed.
 *
 * No `sx` passthrough and no `className`: that escape hatch is what let them drift the first time.
 */
export function SurfaceCard({
  interactive = false,
  children,
}: {
  /** Adds the hover lift. Use for cards that reveal code or navigate somewhere. */
  readonly interactive?: boolean | undefined;
  readonly children: ReactNode;
}) {
  const className = interactive ? `${styles['card']} ${styles['interactive']}` : styles['card'];
  // The stable hook a smoke probe locates cards by — a hashed module class cannot be one.
  return (
    <div data-surface-card className={className}>
      {children}
    </div>
  );
}
