import { AppIconButton, PlaygroundPath } from 'corona';
import { MenuIcon } from '@/shared/ui/icons';
import { ThemeToggleButton } from '@/shared/ui/ThemeToggleButton';
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
        {/* The path is the brand: its current segment carries this playground's mark and name, and
            links to the landing page — the one route the sidebar omits. A separate wordmark beside
            it would say the name twice, which is what the bar used to do. */}
        <PlaygroundPath
          current="boot"
          /* The mark is the annular ring: a hairline circle with nothing filling it. */
          mark={<span className={styles['ring']} aria-hidden="true" />}
        />

        <div className={styles['spacer']} />

        <ThemeToggleButton />
      </div>
    </header>
  );
};
