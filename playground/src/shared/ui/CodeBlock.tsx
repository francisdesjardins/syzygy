import { CopyButton } from '@/shared/ui/CopyButton';
import { type CodeLanguage, HighlightedCode } from '@/shared/ui/HighlightedCode';
import styles from '@/shared/ui/CodeBlock.module.css';

/** Source, coloured, with the one control a reader wants on a code block. */
export function CodeBlock({
  source,
  language = 'tsx',
  wrap = false,
}: {
  readonly source: string;
  readonly language?: CodeLanguage;
  readonly wrap?: boolean;
}) {
  const body = source.trimEnd();

  return (
    <div className={styles['frame']}>
      <CopyButton text={body} className={styles['copy']} />
      <div className={styles['scroll']}>
        <HighlightedCode source={body} language={language} wrap={wrap} />
      </div>
    </div>
  );
}
