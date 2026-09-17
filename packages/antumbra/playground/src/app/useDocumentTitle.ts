import { useDocumentTitle as useTitle } from 'corona';
import { NAV_GROUPS } from '@/widgets/sidebar';

/**
 * The rule lives in [corona](../../../../corona); the two things it needs are this project's.
 *
 * The routes come from `NAV_GROUPS` rather than a second table: the sidebar already names every
 * route in the casing the page heading uses, and two lists of the same thing drift the first time
 * one is edited.
 */
const ROUTES = NAV_GROUPS.flatMap((group) => {
  return group.items;
});

export function useDocumentTitle(): void {
  useTitle({ product: 'Antumbra Playground', routes: ROUTES });
}
