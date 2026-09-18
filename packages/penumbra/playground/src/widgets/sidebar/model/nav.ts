import type { ComponentType } from 'react';

import { LayersIcon, PaletteIcon, RulerIcon } from '@/shared/ui/icons';

export type NavItem = {
  readonly path: string;
  readonly label: string;
  readonly icon: ComponentType;
};

export type NavGroup = {
  readonly label: string;
  readonly items: readonly NavItem[];
};

/**
 * The grouping and the reading order, and the only list of them.
 *
 * `useDocumentTitle` reads it too: the sidebar already names every route in the casing the page
 * heading uses, and two lists of the same thing drift the first time one is edited.
 */
export const NAV_GROUPS: readonly NavGroup[] = [
  {
    label: 'The sheets',
    items: [
      { path: '/tokens', label: 'Tokens', icon: RulerIcon },
      { path: '/skins', label: 'Skins', icon: LayersIcon },
    ],
  },
  {
    label: 'Reference',
    items: [{ path: '/rules', label: 'Rules', icon: PaletteIcon }],
  },
];
