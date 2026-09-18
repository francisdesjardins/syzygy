import { SwitchTable } from '@/shared/ui/SwitchTable';
import type { Faults } from '@/pages/getting-started/examples/fake-api.js';

/**
 * The switches, labelled by what to watch rather than by what breaks.
 *
 * A label naming only the cause — "access service down" — leaves the reader to work out what that
 * should look like. Naming the thing to look for is what turns a toggle into a lesson.
 */
const LABELS: ReadonlyArray<{ key: keyof Faults; label: string; watch: string }> = [
  {
    key: 'signedOut',
    label: 'No session',
    watch:
      'status goes blocked, every other step is skipped, and an intent says where to send them',
  },
  {
    key: 'accessBroken',
    label: 'Access service down',
    watch: 'status goes failed, and the steps that needed access are skipped rather than failed',
  },
  {
    key: 'configDown',
    label: 'Config service down',
    watch: 'status goes degraded: the app still mounts, and only the config subtree is pruned',
  },
  {
    key: 'previewBuild',
    label: 'Preview build',
    watch:
      'the debug branch comes back — it is skipped by default, and that skip is why the run is ready with no errors rather than degraded',
  },
  {
    key: 'tagsHang',
    label: 'Tags hangs',
    watch: 'its bar stops at its own 1.2s budget while everything else finishes normally',
  },
  {
    key: 'trialExpiring',
    label: 'Trial nearly expired',
    watch: 'an intent is queued during preflight and a mounted step waits for your answer',
  },
];

export function FaultSwitches(props: { faults: Faults; onChange: (next: Faults) => void }) {
  return (
    <SwitchTable
      rows={LABELS.map((entry) => {
        return { ...entry, checked: props.faults[entry.key] };
      })}
      onToggle={(key, checked) => {
        props.onChange({ ...props.faults, [key]: checked });
      }}
    />
  );
}
