import type { ReactNode } from 'react';
import { sectionSlug } from 'corona/lib';
import styles from '@/entities/example/ui/ExampleSection.module.css';

/**
 * One labelled band of examples. Every page renders its groups through it, so heading style,
 * vertical rhythm and anchor behaviour are identical rather than re-decided per page.
 */
export function ExampleSection({
  title,
  description,
  id,
  children,
}: {
  readonly title: string;
  /** One line on what the section demonstrates. Omit when the title already says it. */
  readonly description?: string | undefined;
  /** Anchor id for deep links (`#stacking`) and page nav bars; defaults to a slug of the title. */
  readonly id?: string | undefined;
  readonly children: ReactNode;
}) {
  return (
    <section id={id ?? sectionSlug(title)} className={styles['section']}>
      {/* A heading, not a styled span: this labels a band of the page, so it belongs in the outline
          under `PageLayout`'s h1, with the cards' own titles under it as h3. */}
      <h2 className={styles['title']}>{title}</h2>
      {description === undefined ? null : <p className={styles['description']}>{description}</p>}
      <div className={styles['content']}>{children}</div>
    </section>
  );
}
