/**
 * antumbra/plain — the controller binding.
 *
 * A wholesale re-export of the root plus `bindBootstrap`, so a plain-DOM app imports from this path
 * only. Framework-free like the core, but a binding rather than a primitive: it composes what the
 * core decided, it does not decide anything itself.
 *
 * @packageDocumentation
 */

export * from './index.js';
export { bindBootstrap } from './plain/bind-bootstrap.js';
export type { BindOptions, BoundBootstrap } from './plain/bind-bootstrap.js';
