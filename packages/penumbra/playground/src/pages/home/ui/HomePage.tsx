import { Link } from '@tanstack/react-router';
import { AppButton } from 'corona/shell';
import { useTheme } from 'corona/theme';

import { PenumbraMoon } from '@/shared/ui/PenumbraMoon';
import styles from '@/pages/home/ui/HomePage.module.css';

export function HomePage() {
  const { scheme } = useTheme();

  return (
    <div className={styles['page']}>
      <header className={styles['hero']}>
        <div className={styles['mascot']}>
          <PenumbraMoon isDark={scheme === 'dark'} breathing />
        </div>
        <div className={styles['lockup']}>
          <h1 className={styles['title']}>Penumbra</h1>
          <p className={styles['tagline']}>
            A scale with no colour, a palette with no brand, and what a project writes over them.
          </p>
          <p className={styles['body']}>
            Two stylesheets. The first is spacing, rhythm, motion and stacking, with nothing in it a
            project would recognise as its own. The second is the neutral ground and the four
            meanings — colour, but still nobody’s. What is left is eleven declarations, and those
            are yours.
          </p>
          <div className={styles['actions']}>
            <Link to="/tokens" className={styles['cta']}>
              <AppButton variant="contained">See the sheets</AppButton>
            </Link>
            <Link to="/skins" className={styles['cta']}>
              <AppButton variant="outlined">Watch a skin change</AppButton>
            </Link>
          </div>
        </div>
      </header>
    </div>
  );
}
