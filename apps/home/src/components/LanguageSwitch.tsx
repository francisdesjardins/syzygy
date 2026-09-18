import { memo } from 'react';

import { IconButton } from './IconButton';
import { TranslateIcon } from './icons';
import { useLanguage } from '../hooks/useLanguage';
import { handleMisusedPromise } from '../utils/handleMisusedPromise';

const LanguageSwitch = memo(() => {
  const { toggle } = useLanguage();

  const handleOnClick = handleMisusedPromise(toggle);

  return (
    <IconButton onClick={handleOnClick} aria-label="change language">
      <TranslateIcon />
    </IconButton>
  );
});

LanguageSwitch.displayName = 'LanguageSwitch';
export default LanguageSwitch;
