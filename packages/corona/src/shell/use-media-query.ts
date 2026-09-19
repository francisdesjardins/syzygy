import { useSyncExternalStore } from 'react';

/**
 * `window.matchMedia` as a subscription.
 *
 * `useSyncExternalStore` rather than state set from an effect, and the difference is visible: a
 * hook that starts `false` and corrects on mount renders the desktop layout first and the drawer a
 * frame later, on every phone load. Two playgrounds had that version and one had this.
 *
 * The breakpoints the layout uses are written out as numbers on purpose — a media query resolves
 * before the cascade and cannot read a custom property.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => {
        list.removeEventListener('change', onChange);
      };
    },
    () => {
      return window.matchMedia(query).matches;
    }
  );
}
