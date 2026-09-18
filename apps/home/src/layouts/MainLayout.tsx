import type { ReactNode, ReactElement } from 'react';

import LanguageSwitch from '../components/LanguageSwitch';
import ThemeSwitch from '../components/ThemeSwitch';
import styles from './MainLayout.module.css';

export function MainLayout({ children }: { children: ReactNode }): ReactElement {
  return (
    <div className={styles['shell']}>
      <div className={styles['left']}>
        <LanguageSwitch />
      </div>
      <div className={styles['right']}>
        <ThemeSwitch />
      </div>
      {children}
    </div>
  );
}
