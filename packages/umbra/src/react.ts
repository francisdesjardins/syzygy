/**
 * umbra/react — the React binding.
 *
 * A wholesale re-export of the root plus four hooks, so a React app imports from this path only.
 * Everything that decides anything is core; what is here is React's way of subscribing to it and
 * React's way of owning a lifetime.
 *
 * @packageDocumentation
 */

export * from './index.js';
export { BootstrapProvider, useBootstrapContext } from './react/bootstrap-provider.js';
export { useStepData } from './react/use-step-data.js';
export { useBootstrap } from './react/use-bootstrap.js';
export { useIntentHost } from './react/use-intent-host.js';
