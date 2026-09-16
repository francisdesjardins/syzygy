import type { ReactNode } from 'react';
import styles from '@/entities/example/ui/ExampleGrid.module.css';

export function ExampleGrid({
  columns = 1,
  children,
}: {
  readonly columns?: 1 | 2;
  readonly children: ReactNode;
}) {
  return (
    <div className={`${styles['grid']} ${columns === 2 ? styles['two'] : ''}`}>{children}</div>
  );
}
