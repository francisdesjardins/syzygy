import { TopBar as SharedTopBar } from 'corona/shell';
import styles from '@/widgets/top-bar/ui/TopBar.module.css';

/** corona's bar, wearing penumbra's mark. */
export const TopBar = ({
  isMobile,
  onMenuClick,
}: {
  readonly isMobile: boolean;
  readonly onMenuClick: () => void;
}) => {
  return (
    <SharedTopBar
      name="Penumbra"
      /* The mark is the terminator: a disc with half of it in shade, which is the word. */
      mark={<span className={styles['mark']} aria-hidden="true" />}
      isMobile={isMobile}
      onMenuClick={onMenuClick}
    />
  );
};
