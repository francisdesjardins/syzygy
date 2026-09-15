import { type Ref, useEffect } from 'react';
import { AppButton } from '@/shared/ui/AppButton';
import { CopyButton } from '@/shared/ui/CopyButton';
import { type CodeLanguage, HighlightedCode } from '@/shared/ui/HighlightedCode';
import styles from '@/widgets/code-viewer/ui/CodeDialog.module.css';

/**
 * The source of whatever card asked, in the browser's own top layer.
 *
 * A native `<dialog>` with `showModal`, so the backdrop, the dismiss key and the focus trap are the
 * platform's rather than three more things to get wrong.
 */
export function CodeDialog({
  ref,
  title,
  source,
  language,
  onClose,
}: {
  readonly ref: Ref<HTMLDialogElement>;
  readonly title: string;
  readonly source: string;
  readonly language: CodeLanguage;
  readonly onClose: () => void;
}) {
  const open = title !== '';
  const body = source.trimEnd();
  const lineCount = body.split(/\r?\n/).length;

  useEffect(() => {
    const node = typeof ref === 'object' && ref !== null ? ref.current : null;
    if (node === null) {
      return;
    }
    if (open && !node.open) {
      node.showModal();
    }
    if (!open && node.open) {
      node.close();
    }
  }, [open, ref]);

  return (
    <dialog ref={ref} className={styles['dialog']} onClose={onClose} aria-label="Source">
      <div className={styles['head']}>
        <span className={styles['key']}>{title}</span>
        <span className={styles['lines']}>{String(lineCount)} lines</span>
        <CopyButton text={body} />
      </div>
      <div className={styles['body']}>
        <HighlightedCode source={body} language={language} />
      </div>
      <div className={styles['foot']}>
        <AppButton onClick={onClose}>Close</AppButton>
      </div>
    </dialog>
  );
}
