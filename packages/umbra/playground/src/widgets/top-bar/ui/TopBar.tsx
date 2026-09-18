import { TopBar as SharedTopBar } from 'corona/shell';
import styles from '@/widgets/top-bar/ui/TopBar.module.css';

/** corona's bar, wearing umbra's mark. */
export const TopBar = ({
  isMobile,
  onMenuClick,
}: {
  readonly isMobile: boolean;
  readonly onMenuClick: () => void;
}) => {
  return (
    <SharedTopBar
      name="Umbra"
      /* The mark is the annular ring: a hairline circle with nothing filling it. */
      mark={<span className={styles['ring']} aria-hidden="true" />}
      isMobile={isMobile}
      onMenuClick={onMenuClick}
    />
  );
};
