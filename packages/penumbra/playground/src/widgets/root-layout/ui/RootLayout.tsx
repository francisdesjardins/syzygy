import { AppShell } from 'corona/shell';
import { BrandMark } from '@/shared/ui/BrandMark';
import { PenumbraMoon } from '@/shared/ui/PenumbraMoon';
import { NAV_GROUPS } from '@/widgets/sidebar';

/**
 * The shell is corona's; what this playground owns is its name, its mark, its routes and its moon.
 *
 * Providers stay above it — they are `AppRoot`'s job.
 */
export function RootLayout() {
  return (
    <AppShell
      name="Penumbra"
      mark={<BrandMark />}
      groups={NAV_GROUPS}
      current="design"
      moon={(isDark) => {
        return <PenumbraMoon isDark={isDark} />;
      }}
    />
  );
}
