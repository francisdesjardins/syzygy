import { CopyButton } from './CopyButton.tsx';
import { type CodeLanguage, HighlightedCode } from './HighlightedCode.tsx';
import styles from './CodeBlock.module.css';

/** Source, coloured, with the one control a reader wants on a code block. */
export function CodeBlock({
  source,
  language = 'tsx',
  wrap = false,
  lineNumbers = false,
}: {
  readonly source: string;
  readonly language?: CodeLanguage | undefined;
  readonly wrap?: boolean | undefined;
  /** Numbers down the gutter. Worth it for a whole file, noise beside a six-line example. */
  readonly lineNumbers?: boolean | undefined;
}) {
  const body = source.trimEnd();

  return (
    <div className={styles['frame']}>
      <CopyButton text={body} className={styles['copy']} />
      {/* Focusable because it scrolls: a region a mouse can pan and a keyboard cannot is the
          failure axe calls `scrollable-region-focusable`. The group role gives the stop a name. */}
      <div className={styles['scroll']} tabIndex={0} role="group" aria-label="Source, scrollable">
        <HighlightedCode source={body} language={language} wrap={wrap} lineNumbers={lineNumbers} />
      </div>
    </div>
  );
}
