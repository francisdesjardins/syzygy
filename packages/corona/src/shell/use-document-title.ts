import { useRouterState } from '@tanstack/react-router';
import { useEffect } from 'react';

/** One route the sidebar names, which is the only shape of a nav table this needs to know. */
export type TitledRoute = {
  readonly path: string;
  readonly label: string;
};

type DocumentTitleOptions = {
  /** What follows the separator, and what the index says on its own — `Umbra Playground`. */
  readonly product: string;
  /**
   * Every route the sidebar names, flattened. Passed rather than imported because the table is the
   * host's information architecture; the rule for turning it into a title is not.
   */
  readonly routes: readonly TitledRoute[];
};

/**
 * What the browser tab says, and what a screen reader announces first after a route change.
 *
 * The name on its own for the index, `Section · Product` everywhere else — the distinguishing half
 * first, because a tab strip truncates from the right, and a row of tabs all opening with the
 * product name is a row of tabs no one can tell apart.
 *
 * **Labels come from the nav table rather than a second list**: the sidebar already names every
 * route in the casing the page heading uses, and two lists of the same thing drift the first time
 * one is edited. Matching is by prefix so a child route inherits its section — `/api/$category`
 * reads as API Reference, which is also what the sidebar marks current — and the longest match
 * wins, so a section nested under another cannot be captured by its parent.
 *
 * Written from an effect rather than a router hook because there is no server render here and
 * nothing else owns `document.title`; a single-page app that never touches it leaves every route
 * under the title `index.html` shipped with — WCAG 2.4.2 failed on every page but the index, and a
 * browser history that reads as the same entry over and over.
 */
export function useDocumentTitle({ product, routes }: DocumentTitleOptions): void {
  const pathname = useRouterState({
    select: (state) => {
      return state.location.pathname;
    },
  });

  useEffect(() => {
    const match = routes
      .filter((route) => {
        return pathname === route.path || pathname.startsWith(`${route.path}/`);
      })
      .sort((a, b) => {
        return b.path.length - a.path.length;
      })[0];

    document.title = match === undefined ? product : `${match.label} · ${product}`;
  }, [pathname, product, routes]);
}
