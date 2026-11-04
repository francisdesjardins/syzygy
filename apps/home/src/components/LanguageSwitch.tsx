import { memo, type MouseEvent } from 'react';

import styles from './IconButton.module.css';
import { TranslateIcon } from './icons';
import { useLanguage } from '../hooks/useLanguage';

/**
 * A link to the page in the other language, not a button: a crawler follows `?lng=` to the
 * French page the way a reader does. A click switches in place and keeps the address in step.
 */
const LanguageSwitch = memo(() => {
  const { other, otherAddress, toggle } = useLanguage();

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    toggle();
  };

  return (
    <a
      className={styles['button']}
      href={otherAddress}
      hrefLang={other}
      onClick={onClick}
      aria-label="change language"
    >
      <TranslateIcon />
    </a>
  );
});

LanguageSwitch.displayName = 'LanguageSwitch';
export default LanguageSwitch;
