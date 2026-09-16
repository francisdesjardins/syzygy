import type { ReactNode } from 'react';
import styles from '@/shared/ui/PageLayout.module.css';

/**
 * Every page's head, so heading size, measure and rhythm are decided once rather than per page.
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
