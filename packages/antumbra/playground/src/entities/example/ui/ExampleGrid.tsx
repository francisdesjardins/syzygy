import type { ReactNode } from 'react';
import styles from '@/entities/example/ui/ExampleGrid.module.css';

/**
 * The single card grid for the whole playground, so gutters and collapse behaviour are identical
 * everywhere. CSS Grid rather than flex-basis maths: a trailing odd card keeps its neighbours'
 * column width instead of stretching across the row.
 */
export function ExampleGrid({
  columns,
  children,
}: {
  /**
   * Columns at `sm` and up, collapsing to one below. Required, and deliberately: how many columns a
   * band of demos wants is a fact about those demos, not about the playground around them — both of
   * them run about half and half — so a default would only hide the decision on half the call sites.
   */
  readonly columns: 1 | 2;
  readonly children: ReactNode;
}) {
  const className = columns === 1 ? styles['grid'] : `${styles['grid']} ${styles['twoColumns']}`;
  return <div className={className}>{children}</div>;
}
