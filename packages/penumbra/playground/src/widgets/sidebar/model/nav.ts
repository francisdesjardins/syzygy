import type { NavGroup } from 'corona/shell';

import { PaletteIcon } from 'corona/icons';
import { LayersIcon, RulerIcon } from '@/shared/ui/icons';

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
