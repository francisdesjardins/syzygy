import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import IconButton from '@mui/material/IconButton';
import { memo } from 'react';

import { useTheme } from '../hooks/useTheme';

const ThemeSwitch = memo(() => {
  const { isDarkMode, toggle } = useTheme();

  return (
    <IconButton
      onClick={toggle}
      color="inherit"
      aria-label="toggle theme mode"
      sx={{ bgcolor: 'background.default', '&:hover': { bgcolor: 'action.hover' } }}
    >
      {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
});

ThemeSwitch.displayName = 'ThemeSwitch';
export default ThemeSwitch;
