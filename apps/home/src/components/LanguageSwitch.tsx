import { memo } from 'react';

import { IconButton } from './IconButton';
import { TranslateIcon } from './icons';
import { useLanguage } from '../hooks/useLanguage';

const LanguageSwitch = memo(() => {
  const { toggle } = useLanguage();

  return (
    <IconButton onClick={toggle} aria-label="change language">
      <TranslateIcon />
    </IconButton>
  );
});

LanguageSwitch.displayName = 'LanguageSwitch';
export default LanguageSwitch;
