import { AppIconButton } from 'corona';
import { CodeIcon } from 'corona/icons';
import { useCodePane } from '@/shared/lib/code-pane-context';

/**
 * The button on a card that shows what produced it.
 *
 * It deliberately does not re-export the context it reads: a card is an entity and the dialog is a
 * widget, so the only thing that crosses is one function the layout registered.
 */
export function ViewCodeButton({ codeKey }: { readonly codeKey: string }) {
  const { open } = useCodePane();
  if (open === null) {
    return null;
  }
  return (
    <AppIconButton
      size="small"
      aria-label="View source code"
      aria-haspopup="dialog"
      onClick={() => {
        open(codeKey);
      }}
    >
      <CodeIcon />
    </AppIconButton>
  );
}
