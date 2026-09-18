/**
 * The shared config's shape, declared beside it rather than inferred.
 *
 * The module is `.mjs` like the rest of this package, and its callers are `playwright.config.ts`
 * files that every workspace type-checks — so without this they would spread an implicit `any` into
 * a `defineConfig`, which accepts it and reports nothing.
 *
 * `reporter` and `workers` are typed as Playwright types them rather than narrowed here: a literal
 * `'50%'` would widen to `string` and stop satisfying `defineConfig`.
 */
export declare const UNIT_TIMEOUT: number;
export declare const COMPONENT_TIMEOUT: number;

export declare function playwrightBase(options?: { ci?: boolean }): {
  fullyParallel: boolean;
  forbidOnly: boolean;
  retries: number;
  workers: number | string;
  timeout: number;
  reporter: ([string] | [string, { outputFolder: string }])[];
};
