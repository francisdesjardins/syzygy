import { EclipseMark } from '@/shared/ui/EclipseMark';
import { ThemeToggleButton } from '@/shared/ui/ThemeToggleButton';
import { AppIconButton } from '@/shared/ui/AppButton';
import { MenuIcon } from '@/shared/ui/icons';
import styles from '@/widgets/top-bar/ui/TopBar.module.css';
import { PlaygroundPath } from 'corona';

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
          current="dialog"
          /* The flat mark, not the mascot and not a moon phase: the bar says what the product is,
             and says the same thing the browser tab does. `MoonPhase` keeps its real job as a
             heading ornament — a lunar phase is a different drawing from an eclipse. */
          mark={<EclipseMark size={22} />}
        />

        <div className={styles['spacer']} />

        <ThemeToggleButton />
      </div>
    </header>
  );
};
