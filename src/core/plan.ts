import { mustGet } from '../utils/must-get.js';
import { PlanError } from './errors.js';
import type { StepId } from './registry.js';
import type { AnyStep, BootstrapPlan, PlanLevel, StepPhase, StepScope } from './types.js';

/** One step with everything the scheduler needs resolved once, instead of re-derived per run. */
export type PlannedStep = {
  readonly id: StepId;
  readonly step: AnyStep;
  readonly phase: StepPhase;
  readonly needs: readonly StepId[];
  readonly optional: boolean;
  readonly timeout: number | undefined;
  readonly scope: StepScope;
  readonly level: number;
  /** Ids that read this one. The edge the scheduler walks to mark a subtree skipped. */
  readonly dependents: readonly StepId[];
};

export type CompiledPlan = {
  /** What `boot.plan()` hands a caller. */
  readonly plan: BootstrapPlan;
  readonly byId: ReadonlyMap<StepId, PlannedStep>;
  /** Preflight steps grouped by level, levels in order. */
  readonly preflight: readonly (readonly PlannedStep[])[];
  /** Mounted steps grouped by level, numbered after the preflight levels. */
  readonly mounted: readonly (readonly PlannedStep[])[];
};

function phaseOf(step: AnyStep): StepPhase {
  return step.phase ?? 'preflight';
}

/**
 * Longest-path levels over one phase's subgraph, with a cycle reported by name.
 *
 * Kahn's algorithm, and the leftover set when it stalls is the cycle — reporting those ids beats
 * reporting that one exists, because a graph big enough to have a cycle is big enough that finding
 * it by eye is the actual work.
 */
function levelize(
  ids: readonly StepId[],
  edges: ReadonlyMap<StepId, readonly StepId[]>
): StepId[][] {
  const remaining = new Set(ids);
  const levels: StepId[][] = [];
  const settled = new Set<StepId>();

  while (remaining.size > 0) {
    const ready = [...remaining].filter((id) => {
      return mustGet(edges, id).every((need) => {
        return settled.has(need);
      });
    });
    if (ready.length === 0) {
      throw new PlanError(
        `Cycle among steps: ${[...remaining]
          .map((id) => {
            return String(id);
          })
          .join(', ')}.`
      );
    }
    levels.push(ready);
    for (const id of ready) {
      remaining.delete(id);
      settled.add(id);
    }
  }
  return levels;
}

/**
 * Validate the graph and compute its levels, once, before anything runs.
 *
 * Everything wrong here is a programming mistake rather than a runtime condition, so all of it
 * throws {@link PlanError} synchronously. A cycle reported through a status field would be a bug
 * report delivered as data.
 */
export function compilePlan(steps: readonly AnyStep[]): CompiledPlan {
  const byId = new Map<StepId, PlannedStep>();
  const seen = new Set<StepId>();

  for (const step of steps) {
    if (seen.has(step.id)) {
      throw new PlanError(`Duplicate step id "${String(step.id)}".`);
    }
    seen.add(step.id);
  }

  const phases = new Map<StepId, StepPhase>(
    steps.map((step) => {
      return [step.id, phaseOf(step)];
    })
  );

  for (const step of steps) {
    const needs = step.needs ?? [];
    for (const need of needs) {
      const needPhase = phases.get(need);
      if (needPhase === undefined) {
        throw new PlanError(
          `Step "${String(step.id)}" needs "${String(need)}", which no step declares.`
        );
      }
      if (phaseOf(step) === 'preflight' && needPhase === 'mounted') {
        throw new PlanError(
          `Step "${String(step.id)}" is preflight but needs "${String(need)}", which is mounted. ` +
            `Preflight finishes before anything mounts, so that edge can never be satisfied.`
        );
      }
    }
  }

  // Edges within a phase only. A mounted step's preflight dependencies are already settled by the
  // time its phase starts, so counting them would push every mounted step down a level for nothing.
  const edgesFor = (phase: StepPhase): Map<StepId, readonly StepId[]> => {
    return new Map(
      steps
        .filter((step) => {
          return phaseOf(step) === phase;
        })
        .map((step) => {
          return [
            step.id,
            (step.needs ?? []).filter((need) => {
              return phases.get(need) === phase;
            }),
          ];
        })
    );
  };

  const idsOf = (phase: StepPhase): StepId[] => {
    return steps
      .filter((step) => {
        return phaseOf(step) === phase;
      })
      .map((step) => {
        return step.id;
      });
  };

  const preflightLevels = levelize(idsOf('preflight'), edgesFor('preflight'));
  const mountedLevels = levelize(idsOf('mounted'), edgesFor('mounted'));

  const dependents = new Map<StepId, StepId[]>(
    steps.map((step) => {
      return [step.id, []];
    })
  );
  for (const step of steps) {
    for (const need of step.needs ?? []) {
      mustGet(dependents, need).push(step.id);
    }
  }

  const levelOf = new Map<StepId, number>();
  preflightLevels.forEach((ids, index) => {
    for (const id of ids) {
      levelOf.set(id, index);
    }
  });
  mountedLevels.forEach((ids, index) => {
    for (const id of ids) {
      levelOf.set(id, preflightLevels.length + index);
    }
  });

  for (const step of steps) {
    byId.set(step.id, {
      id: step.id,
      step,
      phase: phaseOf(step),
      needs: step.needs ?? [],
      optional: step.optional ?? false,
      timeout: step.timeout,
      scope: step.scope ?? 'app',
      level: mustGet(levelOf, step.id),
      dependents: mustGet(dependents, step.id),
    });
  }

  const plan: BootstrapPlan = {
    levels: [
      ...preflightLevels.map((ids, index): PlanLevel => {
        return { level: index, phase: 'preflight', ids };
      }),
      ...mountedLevels.map((ids, index): PlanLevel => {
        return { level: preflightLevels.length + index, phase: 'mounted', ids };
      }),
    ],
  };

  const resolve = (levels: StepId[][]): PlannedStep[][] => {
    return levels.map((ids) => {
      return ids.map((id) => {
        return mustGet(byId, id);
      });
    });
  };

  return {
    plan,
    byId,
    preflight: resolve(preflightLevels),
    mounted: resolve(mountedLevels),
  };
}
