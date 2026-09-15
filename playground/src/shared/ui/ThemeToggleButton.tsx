import { AppIconButton } from '@/shared/ui/AppIconButton';
import { DarkModeIcon, LightModeIcon } from '@/shared/ui/icons';
import { useTheme } from '@/shared/lib/theme-context';

/** Light or dark, written onto the root element where every token reads it. */
export function ThemeToggleButton() {
  const { scheme, toggle } = useTheme();
  const dark = scheme === 'dark';

  return (
    <AppIconButton
      onClick={toggle}
      size="small"
      // The glyph shows what a click gets you, so the name has to say the same thing — otherwise a
      // screen reader hears "dark mode" on the control that turns dark mode off.
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? <LightModeIcon /> : <DarkModeIcon />}
    </AppIconButton>
  );
}
