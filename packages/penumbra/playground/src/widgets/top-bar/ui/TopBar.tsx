import { Link } from '@tanstack/react-router';
import { AppIconButton } from 'corona/shell';
import { ThemeToggleButton } from 'corona/theme';
import { MenuIcon } from 'corona/icons';
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
        <Link to="/" aria-label="Penumbra — home" className={styles['brand']}>
          {/* The mark is the terminator: a disc with half of it in shade, which is the word. */}
          <span className={styles['mark']} aria-hidden="true" />
          {/* Not an <h1>: the page's own title owns that, and two leave no unique document heading. */}
          <span className={styles['wordmark']}>Penumbra</span>
          <span className={styles['pill']}>Playground</span>
        </Link>

        <div className={styles['spacer']} />

        <ThemeToggleButton />
      </div>
    </header>
  );
};
