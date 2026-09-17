import { useSlideDialog } from 'antumbra/react';
import { useCallback, useState } from 'react';
import { CodeDialogContent } from '@/widgets/code-viewer/ui/CodeDialog';
import styles from '@/widgets/code-viewer/model/useCodeDialog.module.css';
import type { CodeLanguage } from '@/shared/ui/HighlightedCode';

/** Declared once and passed both ways, since the heading and the reference are in two files. */
const CODE_VIEWER_TITLE_ID = 'code-viewer-title';

type Sample = { readonly source: string; readonly language: CodeLanguage };

export type CodeDialogHandle = {
  /** Stable identity, so it works as an effect dependency directly. */
  readonly open: (codeKey: string) => void;
  readonly Dialog: React.ReactNode;
};

/**
 * One panel for the whole app, opened by key.
 *
 * A dialog per card would be a dialog per card in the DOM — sixty of them on the reference page —
 * and the source text they hold is the largest thing the playground ships. One panel and a key is
 * the same feature at a hundredth of the markup.
 *
 * **The dialog is the sibling library's.** The top layer, the dismiss key, the focus trap, the exit
 * animation and the `prepare` phase all arrive with `useSlideDialog`, so what this hook owns is the
 * part that is about code: which key is showing, and fetching its text.
 */
export function useCodeDialog(): CodeDialogHandle {
  const [codeKey, setCodeKey] = useState<string | undefined>(undefined);
  const [samples, setSamples] = useState<Readonly<Record<string, Sample>> | undefined>(undefined);

  const slide = useSlideDialog({
    id: 'code-viewer',
    direction: 'right',
    ariaLabelledBy: CODE_VIEWER_TITLE_ID,
    // Ten `?raw` imports of real source files, and a visitor who never opens this panel needs none
    // of them. Importing the registry here rather than at the top keeps it out of the entry chunk;
    // `prepare` runs with the panel already on screen, and `isPreparing` renders the body.
    prepare: async () => {
      const { codeSamples } = await import('@/widgets/code-viewer/model/code-samples');
      setSamples(codeSamples);
    },
    render: ({ handle, isPreparing }) => {
      const sample = codeKey === undefined ? undefined : samples?.[codeKey];
      return (
        <div className={styles['panel']}>
          <CodeDialogContent
            handle={handle}
            isLoading={isPreparing}
            language={sample?.language ?? 'tsx'}
            source={sample?.source ?? (codeKey === undefined ? '' : `No sample named ${codeKey}.`)}
            title={codeKey ?? ''}
            titleId={CODE_VIEWER_TITLE_ID}
          />
        </div>
      );
    },
  });

  const { open: openSlide } = slide;
  const open = useCallback(
    (key: string) => {
      setCodeKey(key);
      void openSlide();
    },
    [openSlide]
  );

  return { open, Dialog: slide.Dialog };
}
