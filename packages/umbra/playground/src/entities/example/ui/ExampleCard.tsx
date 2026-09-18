import type { ReactNode } from 'react';
import { SurfaceCard } from 'corona/shell';
import { ViewCodeButton } from '@/shared/ui/ViewCodeButton';
import styles from '@/entities/example/ui/ExampleCard.module.css';

/**
 * One demonstration: a title, a line on what it shows, the thing itself, and the source behind it.
 *
 * `codeKey` is the whole point of the card. A demonstration a reader cannot read the code of is a
 * screenshot with extra steps.
 */
export function ExampleCard({
  title,
  description,
  codeKey,
  children,
  example,
}: {
  readonly title: string;
  readonly description?: string | undefined;
  readonly codeKey?: string | undefined;
  readonly children?: ReactNode | undefined;
  readonly example?: ReactNode | undefined;
}) {
  return (
    <SurfaceCard interactive>
      <div className={styles['body']}>
        <div className={styles['head']}>
          <h3 className={styles['title']}>{title}</h3>
          {codeKey === undefined ? null : <ViewCodeButton codeKey={codeKey} />}
        </div>
        {description === undefined ? null : <p className={styles['description']}>{description}</p>}
        {children}
        {example === undefined ? null : <div className={styles['example']}>{example}</div>}
      </div>
    </SurfaceCard>
  );
}
