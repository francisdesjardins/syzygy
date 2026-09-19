import { AppShell } from 'corona/shell';
import { AntumbraMoon } from '@/shared/ui/PeekingMoon/AntumbraMoon';
import { EclipseMark } from '@/shared/ui/EclipseMark';
import { useCodeDialog } from '@/widgets/code-viewer';
import { useCodePane } from '@/shared/lib/code-pane-context';
import { NAV_GROUPS } from '@/widgets/sidebar';
import { useEffect } from 'react';

/**
 * The shell is corona's; what this playground owns is its name, its mark, its routes and its moon.
 *
 * Providers stay above it — they are `app/router.tsx`'s job, and a widget reaching up for them
 * inverts the layer order.
 */
export const RootLayout = () => {
  const codeDialog = useCodeDialog();
  const { setCodeDialogOpen } = useCodePane();

  // `open` keeps a stable identity, so it works as an effect dependency directly.
  const { open } = codeDialog;
  useEffect(() => {
    setCodeDialogOpen(() => {
      return () => {
        return open();
      };
    });
    return () => {
      setCodeDialogOpen(null);
    };
  }, [open, setCodeDialogOpen]);

  return (
    <AppShell
      name="Antumbra"
      /* The flat mark, not the mascot and not a moon phase: the bar says what the product is, and
         says the same thing the browser tab does. `MoonPhase` keeps its real job as a heading
         ornament — a lunar phase is a different drawing from an eclipse. */
      mark={<EclipseMark size={26} />}
      groups={NAV_GROUPS}
      current="dialog"
      moon={(isDark) => {
        return <AntumbraMoon isDark={isDark} />;
      }}
      // `/stories` opens panels at the card edges, where a mascot reads as a fixture misbehaving.
      hideMascotOn={['/', '/stories']}
      overlay={codeDialog.Dialog}
    />
  );
};
