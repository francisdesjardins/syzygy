import { AppShell } from 'corona/shell';
import { BrandMark } from '@/shared/ui/BrandMark';
import { UmbraMoon } from '@/shared/ui/UmbraMoon';
import { useCodeDialog } from '@/widgets/code-viewer';
import { useCodePane } from '@/shared/lib/code-pane-context';
import { NAV_GROUPS } from '@/widgets/sidebar';
import { useEffect } from 'react';

/**
 * The shell is corona's; what this playground owns is its name, its mark, its routes and its moon.
 *
 * Providers are `AppRoot`'s job: a widget reaching up into `app` for them inverts the layer order,
 * and the next widget that does it has a reason too.
 */
export function RootLayout() {
  const codeDialog = useCodeDialog();
  const { setOpen } = useCodePane();

  // `open` keeps a stable identity, so it works as a dependency directly — which is what lets this
  // register once rather than on every render.
  const { open } = codeDialog;
  useEffect(() => {
    setOpen(open);
    return () => {
      setOpen(null);
    };
  }, [open, setOpen]);

  return (
    <AppShell
      name="Umbra"
      mark={<BrandMark />}
      groups={NAV_GROUPS}
      current="boot"
      moon={(isDark) => {
        return <UmbraMoon isDark={isDark} />;
      }}
      // `/stories` renders fixtures at the card edges, where a mascot wandering among them reads as
      // one of them misbehaving.
      hideMascotOn={['/', '/stories']}
      overlay={codeDialog.Dialog}
    />
  );
}
