import { lazy } from 'react';

/**
 * `CodeBlock`, deferred.
 *
 * It pulls the syntax highlighter, and a playground that calls `useCodeDialog` from its root layout
 * would land refractor in the entry chunk for a panel that starts closed on every page. Its own
 * file because a module exporting a component beside anything else loses fast refresh.
 */
export const CodeBlockLazy = lazy(() => {
  return import('./CodeBlock.tsx').then((module) => {
    return { default: module.CodeBlock };
  });
});
