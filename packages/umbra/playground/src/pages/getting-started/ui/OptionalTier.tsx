import { useCallback, useEffect, useState } from 'react';
import { AppButton, SelectionDropdown } from 'corona';
import { clearSharedScope, readStepData } from 'umbra';
import type { BootstrapPlan, Outcome, StepTrace } from 'umbra';
import { PlanGraph } from '@/pages/getting-started/ui/PlanGraph';
import { type Manifest, tierOne, tierTwo } from '@/pages/getting-started/examples/optional-tier';
import styles from '@/pages/getting-started/ui/OptionalTier.module.css';

type Tier = {
  readonly plan: BootstrapPlan;
  readonly timeline: readonly StepTrace[];
  readonly status: string;
};

type Result = {
  readonly one: Tier;
  readonly two: Tier | undefined;
  readonly blockedBy: string | undefined;
};

async function boot(hostAnswers: boolean): Promise<Result> {
  // The realm remembers what it has already done, so a demo that boots on every flip has to forget.
  clearSharedScope();

  const first = tierOne(hostAnswers);
  const outcomeOne: Outcome = await first.run();
  const one: Tier = {
    plan: first.plan(),
    timeline: outcomeOne.timeline,
    status: outcomeOne.status,
  };

  const manifest = readStepData(outcomeOne, 'plugin-manifest') as Manifest | undefined;
  if (manifest === undefined) {
    return { one, two: undefined, blockedBy: undefined };
  }

  const second = tierTwo(manifest.modules);
  const outcomeTwo: Outcome = await second.run();

  return {
    one,
    two: { plan: second.plan(), timeline: outcomeTwo.timeline, status: outcomeTwo.status },
    blockedBy:
      outcomeTwo.status === 'blocked' ? String(outcomeTwo.blockedBy?.step ?? '') : undefined,
  };
}

function TierView(props: { name: string; note: string; tier: Tier }) {
  return (
    <div className={styles['tier']}>
      <div className={styles['tierHead']}>
        <p className={styles['tierName']}>{props.name}</p>
        <span className={`${styles['tierStatus'] ?? ''} status-${props.tier.status}`}>
          {props.tier.status}
        </span>
      </div>
      <p className={styles['tierNote']}>{props.note}</p>
      <PlanGraph plan={props.tier.plan} timeline={props.tier.timeline} />
    </div>
  );
}

/**
 * A branch the app runs without, and the required tier it starts when it fires.
 *
 * Both graphs are drawn by the same `PlanGraph` the section above uses, which is the quiet half of
 * the point: a tier built from data at run time is an ordinary bootstrap, and nothing about reading
 * its plan is special.
 */
export function OptionalTier() {
  const [hostAnswers, setHostAnswers] = useState(true);
  const [result, setResult] = useState<Result | undefined>(undefined);

  const run = useCallback((answers: boolean) => {
    void boot(answers).then(setResult);
  }, []);

  useEffect(() => {
    run(hostAnswers);
  }, [run, hostAnswers]);

  if (result === undefined) {
    return null;
  }

  return (
    <div>
      <div className={styles['controls']}>
        <SelectionDropdown
          id="plugin-host"
          aria-label="Plugin host"
          value={hostAnswers ? 'up' : 'absent'}
          data-testid="plugin-host"
          onChange={(event) => {
            setHostAnswers(event.target.value === 'up');
          }}
        >
          <option value="up">Plugin host answers</option>
          <option value="absent">Plugin host is absent</option>
        </SelectionDropdown>
        <AppButton
          variant="outlined"
          data-testid="optional-tier-again"
          onClick={() => {
            run(hostAnswers);
          }}
        >
          Boot again
        </AppButton>
        <p className={styles['verdict']} data-testid="optional-tier-verdict">
          {hostAnswers
            ? 'The branch fired, so a second bootstrap was declared from what it found — and that one is allowed to refuse.'
            : 'The branch failed, and everything under it was skipped. The run is degraded rather than failed, and the app mounts.'}
        </p>
      </div>

      <TierView
        name="tier one — the app"
        note="plugin-host is the only step marked optional. plugin-manifest is not, and does not need to be: a step runs only when every one of its needs succeeded, so marking the root makes the whole branch optional."
        tier={result.one}
      />

      {result.two === undefined ? (
        <p className={styles['absent']} data-testid="optional-tier-absent">
          No tier two. The branch produced no manifest, so there is nothing to declare a second
          bootstrap from — and nothing went wrong that the app has to report.
        </p>
      ) : (
        <TierView
          name="tier two — the modules it found"
          note={
            result.blockedBy === undefined
              ? 'Declared from the manifest. Nothing here is optional: a module loads completely or not at all.'
              : `Declared from the manifest, and required: ${result.blockedBy} refused the mount, which tier one could not have done about ids that did not exist when its graph was compiled. The step that decided reads blocked; the ones it stopped read cancelled.`
          }
          tier={result.two}
        />
      )}
    </div>
  );
}
