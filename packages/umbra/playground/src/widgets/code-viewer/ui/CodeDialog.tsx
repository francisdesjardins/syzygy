import type { DialogHandle } from 'antumbra/react';
import { AppButton } from 'corona';
import { CopyButton } from '@/shared/ui/CopyButton';
import { type CodeLanguage, HighlightedCode } from '@/shared/ui/HighlightedCode';
import styles from '@/widgets/code-viewer/ui/CodeDialog.module.css';

/**
 * The source of whatever card asked.
 *
 * Only the contents: the panel, the top layer, the dismiss key and the focus trap belong to the
 * slide that renders this, so nothing here opens or closes anything except through `handle`.
 */
export function CodeDialogContent({
  handle,
  isLoading,
  language,
  source,
  title,
  titleId,
}: {
  readonly handle: DialogHandle;
  readonly isLoading: boolean;
  readonly language: CodeLanguage;
  readonly source: string;
  readonly title: string;
  readonly titleId: string;
}) {
  const body = source.trimEnd();
  const lineCount = body.split(/\r?\n/).length;

  return (
    <>
      <div className={styles['head']}>
        <span className={styles['key']} id={titleId}>
          {title}
        </span>
        {isLoading ? null : <span className={styles['lines']}>{String(lineCount)} lines</span>}
        {isLoading ? null : <CopyButton text={body} />}
      </div>
      <div className={styles['body']}>
        {isLoading ? (
          <p className={styles['loading']}>Loading source…</p>
        ) : (
          <HighlightedCode source={body} language={language} />
        )}
      </div>
      <div className={styles['foot']}>
        <AppButton
          variant="outlined"
          onClick={() => {
            handle.close('close');
          }}
        >
          Close
        </AppButton>
      </div>
    </>
  );
}
