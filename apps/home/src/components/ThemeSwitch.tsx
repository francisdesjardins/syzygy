import { memo } from 'react';

import { IconButton } from './IconButton';
import { MoonIcon, SunIcon } from './icons';
import { useTheme } from '../hooks/useTheme';

const ThemeSwitch = memo(() => {
  const { isDarkMode, toggle } = useTheme();

  return (
    <IconButton
      onClick={toggle}
      // The glyph shows what a click gets you, so the name has to say the same thing — otherwise a
      // screen reader hears "dark mode" on the control that turns dark mode off.
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? <SunIcon /> : <MoonIcon />}
    </IconButton>
  );
});

ThemeSwitch.displayName = 'ThemeSwitch';
export default ThemeSwitch;
