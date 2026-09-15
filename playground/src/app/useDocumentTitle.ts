import { NAV_GROUPS } from '@/widgets/sidebar';
import { useRouterState } from '@tanstack/react-router';
import { useEffect } from 'react';

/**
 * What the browser tab says, and what a screen reader announces first after a route change.
 *
 * The name on its own for the index, `Section · Product` everywhere else — the distinguishing half
 * first, because a tab strip truncates from the right, and a row of tabs all opening with the
 * product name is a row of tabs no one can tell apart.
 */
const PRODUCT = 'Antumbra Playground';

/**
 * Labels come from `NAV_GROUPS` rather than a second table: the sidebar already names every route
 * in the casing the page heading uses, and two lists of the same thing drift the first time one is
 * edited. Matching is by prefix so a child route inherits its section — `/api/$category` reads as
 * API Reference, which is also what the sidebar marks current — and the longest match wins, so a
 * section nested under another cannot be captured by its parent.
 */
const titleFor = (pathname: string): string => {
  const match = NAV_GROUPS.flatMap((group) => {
    return group.items;
  })
    .filter((item) => {
      return pathname === item.path || pathname.startsWith(`${item.path}/`);
    })
    .sort((a, b) => {
      return b.path.length - a.path.length;
    })[0];

  return match === undefined ? PRODUCT : `${match.label} · ${PRODUCT}`;
};

/**
 * Written from an effect rather than a router hook because there is no server render here and
 * nothing else owns `document.title`; a single-page app that never touches it leaves every route
 * under the title `index.html` shipped with — WCAG 2.4.2 failed on every page but the index, and
 * a browser history that reads as the same entry over and over.
 */
export function useDocumentTitle(): void {
  const pathname = useRouterState({
    select: (state) => {
      return state.location.pathname;
    },
  });

  useEffect(() => {
    document.title = titleFor(pathname);
  }, [pathname]);
}
