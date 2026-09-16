import type { ReactNode } from 'react';
import styles from '@/shared/ui/SurfaceCard.module.css';

/** The one card in the system. Every panel on every page is this, so none of them decides again. */
export function SurfaceCard({
  children,
  interactive = false,
}: {
  readonly children: ReactNode;
  readonly interactive?: boolean;
}) {
  return (
    <div className={`${styles['card']} ${interactive ? styles['interactive'] : ''}`}>
      {children}
    </div>
  );
}
