import type { ReactNode } from 'react';
import { SurfaceCard } from 'corona/shell';
import { ViewCodeButton } from '@/shared/ui/ViewCodeButton/ViewCodeButton';
import styles from '@/entities/example/ui/ExampleCard.module.css';

type ExampleCardProps = {
  readonly title: string;
  readonly description?: string | undefined;
  readonly codeKey?: string | undefined;
  readonly children?: ReactNode | undefined;
  readonly example?: ReactNode | undefined;
};

/**
 * One demonstration: a title, a line on what it shows, the thing itself, and the source behind it.
 *
 * `codeKey` is the whole point of the card. A demonstration a reader cannot read the code of is a
 * screenshot with extra steps.
 *
 * `example` and `children` are alternatives rather than slots that stack: a card either shows a
 * rendered demo or lays out its own controls, and the two want different arrangements.
 */
export function ExampleCard({ title, description, codeKey, children, example }: ExampleCardProps) {
  return (
    <SurfaceCard interactive>
      <div className={styles['body']}>
        <div className={styles['head']}>
          <h3 className={styles['title']}>{title}</h3>
          {codeKey === undefined ? null : <ViewCodeButton codeKey={codeKey} />}
        </div>
        {description === undefined ? null : <p className={styles['description']}>{description}</p>}
        {example === undefined ? (
          <div className={styles['controls']}>{children}</div>
        ) : (
          <div className={styles['example']}>{example}</div>
        )}
      </div>
    </SurfaceCard>
  );
}
