/**
 * What the examples are written as if the reader's app had declared.
 *
 * A snippet shows a call against a surface the reader already has — a save, a load, a URL — and
 * naming those stand-ins here is what lets the compiler report misuse of this package rather than
 * the absence of an application around it.
 *
 * The top-level `export {}` is load-bearing: without one a `.d.ts` is a global script, and a
 * `declare module` in a script declares a module rather than augmenting one.
 *
 * Not shipped, and imported by nothing.
 */
export {};

declare global {
  function save(value: unknown): Promise<void>;
  function load(signal?: AbortSignal): Promise<unknown>;
  const a: unknown;
  const b: unknown;
  const url: string;
}
