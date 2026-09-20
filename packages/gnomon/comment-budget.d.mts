/**
 * The scanner's shape, declared beside it rather than inferred.
 *
 * The module is `.mjs` like the rest of this package, and its callers are `*.test.ts` files that
 * every workspace type-checks — so without this they would destructure an implicit `any` and the
 * assertions below would be checking nothing in particular.
 */

export declare const OVER_BUDGET: string;
export declare const NARRATING: string;

export declare function commentBudget(options: {
  /** The package directory the `roots` below are resolved against. */
  readonly root: string;
  /** The trees to scan, relative to `root`. Defaults to `['src']`. */
  readonly roots?: readonly string[];
  /** Words allowed in a `//` run or a bare block comment. */
  readonly lineBudget?: number;
  /** Words allowed in a JSDoc block that the public-API exception does not reach. */
  readonly jsdocBudget?: number;
  /** Platform terms a package cannot spell another way, applied before the past-tense scan. */
  readonly pastExemptions?: readonly (readonly [RegExp, string])[];
}): {
  /** Every comment block found, which a caller asserts a floor on so a pass cannot be vacuous. */
  readonly blocks: number;
  readonly files: number;
  /** `path:line — N words`, one per block over its own budget. */
  readonly over: readonly string[];
  /** `path:line`, one per block narrating the past. */
  readonly narrating: readonly string[];
};
