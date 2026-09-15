/**
 * antumbra — a bootstrap orchestrator with no framework in it.
 *
 * Steps declare what they read; the parallelism is what the graph allows. The run produces a frozen,
 * typed outcome carrying the data, the facts it recorded on the way (notices) and the UI work it
 * could not do itself (intents). A binding picks the intents up once something has mounted.
 *
 * Everything reachable from this entry point resolves with no framework installed, and
 * `entry-isolation.test.ts` is what keeps that true.
 *
 * @packageDocumentation
 */

export { createBootstrap } from './core/create-bootstrap.js';
export type {
  Bootstrap,
  BootstrapOptions,
  CreateBootstrapOptions,
} from './core/create-bootstrap.js';
export { defineMountedStep, defineStep } from './core/define-step.js';
export type { RunEvent } from './core/events.js';
export {
  BootstrapError,
  PlanError,
  StepSkippedError,
  UndeclaredDependencyError,
} from './core/errors.js';
export { attachIntentHost } from './core/intent-host.js';
export type {
  AttachedIntentHost,
  ForwardedIntent,
  IntentControls,
  IntentHostOptions,
} from './core/intent-host.js';
export { clearSharedScope } from './core/shared-scope.js';
export { readStepData } from './core/read-data.js';
export { DEFAULT_DEADLINE_MS } from './core/scheduler.js';
export type { MountReport, Session, SessionState } from './core/session.js';
export type { RunObserver, RunStage, RunSnapshot } from './core/run-observer.js';
export type { ReadableStore, Store } from './store/create-store.js';
export { normalizeError } from './utils/normalize-error.js';
export { systemClock } from './utils/clock.js';
export type { Clock } from './utils/clock.js';

export type {
  StepRegistry,
  DataOf,
  IntentRegistry,
  IntentType,
  NoticeRegistry,
  NoticeType,
  PayloadArgs,
  StepId,
  UiPort,
} from './core/registry.js';

export type {
  AbortReason,
  AbortReasonKind,
  AnyStep,
  RunData,
  BootstrapPlan,
  RunStatus,
  IdsOf,
  StepListCheck,
  Intent,
  IntentStatus,
  MountedContext,
  Notice,
  Outcome,
  PartialRunData,
  PlanLevel,
  PreflightContext,
  SerializedError,
  Step,
  StepContext,
  StepFailure,
  StepStatus,
  StepPhase,
  StepReturn,
  StepScope,
  StepTrace,
} from './core/types.js';
