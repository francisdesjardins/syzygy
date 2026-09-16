import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { CodePaneContext, type Opener } from '@/shared/lib/code-pane-context';

/**
 * Holds the one function that opens the code dialog, so a card can ask for it without knowing where
 * the dialog lives.
 *
 * The opener is kept **inside an object**. A state setter handed a function calls it as an updater
 * rather than storing it, so `setOpen(open)` ran the opener during this component's render — which
 * React reports as a state update from inside another component's render, on every page.
 */
export function CodePaneProvider({ children }: { readonly children: ReactNode }) {
  const [held, setHeld] = useState<{ readonly open: Opener }>({ open: null });

  const setOpen = useCallback((open: Opener) => {
    setHeld({ open });
  }, []);

  const value = useMemo(() => {
    return { open: held.open, setOpen };
  }, [held, setOpen]);

  return <CodePaneContext value={value}>{children}</CodePaneContext>;
}
