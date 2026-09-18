import { Link } from '@tanstack/react-router';
import { AppIconButton } from 'corona';
import { MenuIcon } from '@/shared/ui/icons';
import { ThemeToggleButton } from 'corona';
import styles from '@/widgets/top-bar/ui/TopBar.module.css';

type TopBarProps = {
  readonly isMobile: boolean;
  readonly onMenuClick: () => void;
};

export const TopBar = ({ isMobile, onMenuClick }: TopBarProps) => {
  return (
    <header className={styles['appBar']}>
      <div className={styles['toolbar']}>
        {isMobile && (
          <AppIconButton
            className={styles['menuButton']}
            onClick={onMenuClick}
            aria-label="Open navigation"
          >
            <MenuIcon />
          </AppIconButton>
        )}
        {/* The brand is the way home — the landing page is the one route not in the sidebar. The
            way out of the playground is at the foot of the drawer, with the rest of the menu. */}
        <Link to="/" aria-label="umbra — home" className={styles['brand']}>
          {/* The mark is the annular ring: a hairline circle with nothing filling it. */}
          <span className={styles['ring']} aria-hidden="true" />
          {/* Not an <h1>: the page's own title owns that, and two leave no unique document heading. */}
          <span className={styles['wordmark']}>Umbra</span>
          <span className={styles['pill']}>Playground</span>
        </Link>

        <div className={styles['spacer']} />

        <ThemeToggleButton />
      </div>
    </header>
  );
};
