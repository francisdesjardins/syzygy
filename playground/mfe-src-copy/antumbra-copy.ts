// A second, deliberately separate build of the same library.
//
// The fourth fragment imports this instead of the shared `antumbra`, so it holds its own module
// instance — its own closures, its own module-level everything. It still adopts the page's
// page-scoped results, because the registry those live in is keyed by `Symbol.for` on `globalThis`
// rather than by module identity.
//
// That is the difference this demo exists to show. A library whose sharing is a module singleton
// needs the host to dedupe it, and fails silently when the host gets that wrong.
export * from '../../src/index.js';
