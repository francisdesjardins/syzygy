/**
 * umbra/solid — the Solid binding.
 *
 * The same four names as `umbra/react`, over the same core, plus `fromStore`. A team running both
 * writes the same bootstrap twice with the same words.
 *
 * One difference, and it is the renderer's: **every value here is an accessor, so do not destructure
 * what these return.**
 *
 * @packageDocumentation
 */

export * from './index.js';
export { BootstrapProvider, useBootstrapContext } from './solid/bootstrap-provider.js';
export { fromStore } from './solid/from-store.js';
export { useStepData } from './solid/use-step-data.js';
export { useBootstrap } from './solid/use-bootstrap.js';
export { useIntentHost } from './solid/use-intent-host.js';
