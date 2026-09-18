import { EclipseMark } from '@/shared/ui/EclipseMark';
import { TopBar as SharedTopBar } from 'corona/shell';

/** corona's bar, wearing antumbra's mark. */
export const TopBar = ({
  isMobile,
  onMenuClick,
}: {
  readonly isMobile: boolean;
  readonly onMenuClick: () => void;
}) => {
  return (
    <SharedTopBar
      name="Antumbra"
      /* The flat mark, not the mascot and not a moon phase: the bar says what the product is, and
         says the same thing the browser tab does. `MoonPhase` keeps its real job as a heading
         ornament — a lunar phase is a different drawing from an eclipse. */
      mark={<EclipseMark size={26} />}
      isMobile={isMobile}
      onMenuClick={onMenuClick}
    />
  );
};
