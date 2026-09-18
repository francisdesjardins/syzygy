import type { ComponentType, SVGProps } from 'react';
import {
  AutoAwesomeIcon,
  CodeIcon,
  HubIcon,
  LocalFireDepartmentIcon,
  MenuBookIcon,
  PaletteIcon,
  PlayArrowIcon,
  ScienceIcon,
  SettingsIcon,
  TuneIcon,
  ViewSidebarIcon,
  WidgetsIcon,
} from '@/shared/ui/icons';

export type NavItem = {
  readonly path: string;
  readonly label: string;
  readonly icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export type NavGroup = {
  readonly label: string;
  readonly items: readonly NavItem[];
};

/** Grouped so the routes read as a path: core loop, patterns on it, reference, harnesses. */
export const NAV_GROUPS: readonly NavGroup[] = [
  {
    label: 'Learn',
    items: [
      { path: '/getting-started', label: 'Getting Started', icon: PlayArrowIcon },
      { path: '/dialog-actions', label: 'Dialog Actions', icon: SettingsIcon },
    ],
  },
  {
    label: 'Patterns',
    items: [
      { path: '/slide-dialog', label: 'Slide Dialogs', icon: ViewSidebarIcon },
      { path: '/stacking', label: 'Stacking', icon: WidgetsIcon },
      { path: '/imperative', label: 'Imperative Control', icon: TuneIcon },
      { path: '/interop', label: 'Interop', icon: CodeIcon },
      { path: '/showcases', label: 'Showcases', icon: LocalFireDepartmentIcon },
      { path: '/microfrontends', label: 'Microfrontends', icon: HubIcon },
    ],
  },
  {
    label: 'Reference',
    items: [
      { path: '/ui-integrations', label: 'UI Integrations', icon: AutoAwesomeIcon },
      { path: '/ui-templates', label: 'UI Templates', icon: WidgetsIcon },
      { path: '/skin', label: 'Our skin', icon: PaletteIcon },
      { path: '/api', label: 'API Reference', icon: MenuBookIcon },
    ],
  },
  {
    label: 'Testing',
    items: [
      { path: '/stories', label: 'Test Harnesses', icon: ScienceIcon },
      // Deliberately last and deliberately empty — a scratch surface, not a tenth demonstration.
    ],
  },
];
