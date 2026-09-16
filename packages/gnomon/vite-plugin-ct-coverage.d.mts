/**
 * The instrumenter's shape, declared beside it rather than inferred.
 *
 * The plugin is `.mjs` by design — it runs in Vite's own config load, before anything compiles it —
 * so a consumer importing it from a type-checked config had it as an implicit `any`. That was
 * invisible while only `playwright.config.ts` imported it, since a library's root `tsconfig`
 * includes `src/**` and nothing else; a playground's config *is* checked, and the move put it there.
 *
 * **The plugin type comes from the caller.** This package declares vite an optional peer and does
 * not install it: importing `Plugin` here resolves to nothing and hands every consumer an `any`,
 * reported by a type-aware rule at the consumer, where the cause is invisible. Installing vite here
 * would instead put a second copy beside each library's own, and two structurally identical
 * `Plugin` types are not assignable to one another — the same trap that decided this repository's
 * hoisting boundary. So the return type is inferred from the position the call sits in, which is
 * the consumer's own `Plugin`, and the `unknown` default makes a context-free call fail loudly
 * rather than silently widen.
 */
export declare function ctCoverage<TPlugin = unknown>(options: {
  /** The library package's directory. Its `src/` is what gets instrumented. */
  root: string;
  include?: (id: string) => boolean;
}): TPlugin;
