import type { ReactNode } from 'react';
import styles from './PageLayout.module.css';

/**
 * Every page's head, so heading size, measure and rhythm are decided once rather than per page.
 *
 * All three playgrounds use this one. antumbra kept a copy with an extra `result` panel, which was
 * going to need a slot here — until the count said otherwise: eleven pages rendered that layout and
 * none of them passed a `result`. The prop, the panel it built and the copy around it went instead
 * of a slot nobody would have filled. `ResultDisplay` itself is alive and stayed where it is, on
 * the example cards that actually show one.
 */
export function PageLayout({
  title,
  description,
  actions,
  children,
}: {
  readonly title: string;
  readonly description: string;
  readonly actions?: ReactNode | undefined;
  readonly children: ReactNode;
}) {
  return (
    <div className={styles['root']}>
      <div className={styles['header']}>
        <div className={styles['heading']}>
          <h1 className={styles['title']}>{title}</h1>
          <p className={styles['description']}>{description}</p>
        </div>
        {actions === undefined ? null : <div className={styles['actions']}>{actions}</div>}
      </div>
      {children}
    </div>
  );
}
