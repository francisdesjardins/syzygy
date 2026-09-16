import type { Plugin } from 'vite';

/**
 * The instrumenter's shape, declared beside it rather than inferred.
 *
 * The plugin is `.mjs` by design — it runs in Vite's own config load, before anything compiles it —
 * so the playground's type-checked config would otherwise import it as an implicit `any`.
 */
export declare function ctCoverage(): Plugin;
