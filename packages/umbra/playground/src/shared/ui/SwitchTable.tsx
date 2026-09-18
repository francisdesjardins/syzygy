import styles from '@/shared/ui/SwitchTable.module.css';

export type SwitchRow = {
  readonly key: string;
  readonly label: string;
  /**
   * What to watch change, rather than what it breaks.
   *
   * A label naming only the cause — "access service down" — leaves the reader to work out what that
   * should look like. Naming the thing to look for is what turns a toggle into a lesson, and it is
   * why this column exists rather than a tooltip.
   */
  readonly watch: string;
  readonly checked: boolean;
};

/**
 * The switches a demo frame is driven by, on both pages that have one.
 *
 * Shared because the two were drifting into two answers for one job: a table on the one-application
 * page and a row of buttons on the micro-frontend one, which ran out of width at the fourth switch.
 * Where the checked state lives is the caller's business — component state on one page, the address
 * on the other, because that frame carries links of its own.
 */
export function SwitchTable(props: {
  rows: readonly SwitchRow[];
  onToggle: (key: string, checked: boolean) => void;
}) {
  return (
    <table className={styles['table']}>
      <thead>
        <tr>
          <th scope="col">Make it happen</th>
          <th scope="col">Watch for</th>
        </tr>
      </thead>
      <tbody>
        {props.rows.map((row) => {
          return (
            <tr key={row.key}>
              <td>
                <label>
                  <input
                    type="checkbox"
                    checked={row.checked}
                    onChange={(event) => {
                      props.onToggle(row.key, event.target.checked);
                    }}
                  />
                  <span>{row.label}</span>
                </label>
              </td>
              <td>{row.watch}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
