import type { ReactNode } from 'react';
import { sectionSlug } from '@/shared/lib/section-slug';
import styles from '@/entities/example/ui/ExampleSection.module.css';

/**
 * One labelled band of a page. Every page renders its groups through it, so heading style, vertical
 * rhythm and anchor behaviour are identical rather than re-decided per page.
 */
export function ExampleSection({
  title,
  description,
  id,
  children,
}: {
  readonly title: string;
  readonly description?: string | undefined;
  readonly id?: string | undefined;
  readonly children: ReactNode;
}) {
  return (
    <section id={id ?? sectionSlug(title)} className={styles['section']}>
      <h2 className={styles['title']}>{title}</h2>
      {description === undefined ? null : <p className={styles['description']}>{description}</p>}
      <div className={styles['content']}>{children}</div>
    </section>
  );
}
