import { useCallback, useRef, useState } from 'react';
import { CodeDialog } from '@/widgets/code-viewer/ui/CodeDialog';
import { codeSamples } from '@/widgets/code-viewer/model/code-samples';

export type CodeDialogHandle = {
  /** Stable identity, so it works as an effect dependency directly. */
  readonly open: (codeKey: string) => void;
  readonly Dialog: React.ReactNode;
};

/**
 * One dialog for the whole app, opened by key.
 *
 * A dialog per card would be a dialog per card in the DOM — sixty of them on the reference page —
 * and the source text they hold is the largest thing the playground ships. One dialog and a key is
 * the same feature at a hundredth of the markup.
 */
export function useCodeDialog(): CodeDialogHandle {
  const [codeKey, setCodeKey] = useState<string | undefined>(undefined);
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const open = useCallback((key: string) => {
    setCodeKey(key);
  }, []);

  const close = useCallback(() => {
    setCodeKey(undefined);
  }, []);

  const sample = codeKey === undefined ? undefined : codeSamples[codeKey];

  return {
    open,
    Dialog: (
      <CodeDialog
        ref={dialogRef}
        title={codeKey ?? ''}
        source={sample?.source ?? (codeKey === undefined ? '' : `No sample named ${codeKey}.`)}
        language={sample?.language ?? 'tsx'}
        onClose={close}
      />
    ),
  };
}
