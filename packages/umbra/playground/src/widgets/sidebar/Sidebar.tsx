import { Sidebar as SharedSidebar } from 'corona/shell';

import { NAV_GROUPS } from '@/widgets/sidebar/model/nav';

type SidebarProps = {
  readonly isMobile: boolean;
  readonly mobileOpen: boolean;
  readonly onClose: () => void;
};

/**
 * The drawer is [corona](../../../../../corona)'s; what this playground owns is its routes, which
 * `NAV_GROUPS` names, and the icons beside them.
 */
export function Sidebar(props: SidebarProps) {
  return <SharedSidebar {...props} groups={NAV_GROUPS} current="boot" />;
}
