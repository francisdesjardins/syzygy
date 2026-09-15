import { Link } from '@tanstack/react-router';
import { AppButton } from '@/shared/ui/AppButton';
import { ThemeToggleButton } from '@/shared/ui/ThemeToggleButton';
import styles from '@/widgets/top-bar/ui/TopBar.module.css';

export function TopBar({
  isMobile,
  onMenuClick,
}: {
  readonly isMobile: boolean;
  readonly onMenuClick: () => void;
}) {
  return (
    <header className={styles['bar']}>
      {isMobile ? (
        <AppButton variant="ghost" onClick={onMenuClick} aria-label="Open navigation">
          Menu
        </AppButton>
      ) : null}
      {/* The brand is the way home — the landing page is the one route the sidebar also lists, and
          a reader who scrolled into the reference expects the mark to take them back. */}
      <Link to="/" aria-label="antumbra — home" className={styles['mark']}>
        {/* The mark is the annular ring: a hairline circle with nothing filling it. */}
        <span className={styles['ring']} aria-hidden="true" />
        {/* Not an <h1>: the page's own title owns that, and two leave no unique document heading. */}
        <span className={styles['name']}>antumbra</span>
        <span className={styles['tag']}>bootstrap orchestration</span>
      </Link>
      <span className={styles['spacer']} />
      <ThemeToggleButton />
    </header>
  );
}
