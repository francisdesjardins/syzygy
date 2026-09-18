import type { ReactNode } from 'react';
import styles from './PageLayout.module.css';

/**
 * Every page's head, so heading size, measure and rhythm are decided once rather than per page.
 *
 * antumbra's is a superset — it also renders a result panel from a `result` string, backed by a
 * component only that playground has, across twenty-nine call sites. Turning that into a slot is
 * worth doing and is not this change.
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
