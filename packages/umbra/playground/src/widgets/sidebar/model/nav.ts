import type { NavGroup } from 'corona/shell';

import { HubIcon, MenuBookIcon, PaletteIcon, PlayArrowIcon, WidgetsIcon } from 'corona/icons';

/**
 * Grouped so the routes read as a path: the idea, then the shapes it takes, then the reference.
 *
 * The same four groups antumbra's sidebar carries, in the same order and the same casing — a reader
 * who knows one playground should not have to re-learn the other's menu. `/` is deliberately
 * absent: the brand in the top bar is the way home, and listing it here would be two controls for
 * one route.
 */
export const NAV_GROUPS: readonly NavGroup[] = [
  {
    label: 'Learn',
    items: [{ path: '/getting-started', label: 'One Application', icon: PlayArrowIcon }],
  },
  {
    label: 'Patterns',
    items: [
      { path: '/microfrontends', label: 'Four Fragments', icon: HubIcon },
      { path: '/single-spa', label: 'With single-spa', icon: WidgetsIcon },
    ],
  },
  {
    label: 'Reference',
    items: [
      { path: '/skin', label: 'Our skin', icon: PaletteIcon },
      { path: '/api', label: 'API Reference', icon: MenuBookIcon },
    ],
  },
];
