import { createContext, use } from 'react';

export type Opener = ((codeKey: string) => void) | null;

export type CodePaneValue = {
  readonly open: Opener;
  readonly setOpen: (opener: Opener) => void;
};

/**
 * The seam between the card that asks for code and the one dialog that shows it.
 *
 * Deliberately holding a *setter*: the layout registers the opener once it has one, and nothing
 * below has to know the dialog exists. Split from the provider for the same fast-refresh reason as
 * the theme.
 */
export const CodePaneContext = createContext<CodePaneValue | undefined>(undefined);

export function useCodePane(): CodePaneValue {
  const value = use(CodePaneContext);
  if (value === undefined) {
    throw new Error('useCodePane was called outside a <CodePaneProvider>.');
  }
  return value;
}
