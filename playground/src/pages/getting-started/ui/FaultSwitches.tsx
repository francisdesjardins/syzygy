import type { Faults } from '@/pages/getting-started/examples/fake-api.js';

/**
 * The switches, labelled by what to watch rather than by what breaks.
 *
 * The first version named the cause — "access service down" — and left the reader to work out what
 * that should look like. Naming the thing to look for is what turns a toggle into a lesson.
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
    <table className="switches">
      <thead>
        <tr>
          <th scope="col">Make it happen</th>
          <th scope="col">Watch for</th>
        </tr>
      </thead>
      <tbody>
        {LABELS.map((entry) => {
          return (
            <tr key={entry.key}>
              <td>
                <label>
                  <input
                    type="checkbox"
                    checked={props.faults[entry.key]}
                    onChange={(event) => {
                      props.onChange({ ...props.faults, [entry.key]: event.target.checked });
                    }}
                  />
                  <span className="switch-label">{entry.label}</span>
                </label>
              </td>
              <td className="switch-effect">{entry.watch}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
