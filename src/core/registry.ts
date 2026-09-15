/**
 * The project-level registries: the places a consumer declares what their bootstrap produces, so
 * that a step id, a notice type and an intent type stop being bare `string` at every door.
 *
 * Nothing here is required. All four interfaces ship empty, and while one is empty its ids accept
 * any string, so every call site works before a single declaration exists.
 *
 * **Declare as few or as many as you like.** An id a registry does not name still works, which is
 * what lets a project adopt this one step at a time and host steps it does not own. What a declared
 * entry buys is its contract: the runner reads a step's data type off its id, `notice` and `intent`
 * read their payload off their type, and a mounted step reads the UI port off {@link HostCapabilities}.
 *
 * The trade is that a mistyped id is **not** an error, because an unknown id is a supported one.
 * The editor still completes the declared names, and the list is still the index.
 *
 * @example
 * declare module 'antumbra' {
 *   interface StepRegistry {
 *     session: { userId: string; expiresAt: number };
 *     config: WorkspaceConfig;
 *   }
 *   interface NoticeRegistry {
 *     'config:from-cache': { age: number };
 *     'boot:offline': void;
 *   }
 *   interface IntentRegistry {
 *     'warn:trial-expiring': { daysLeft: number };
 *   }
 *   interface HostCapabilities {
 *     confirm: (message: string) => Promise<boolean>;
 *   }
 * }
 */

/**
 * Step id to the data that step resolves with. The one registry the runner reads to type both
 * `ctx.get` and `outcome.data`.
 */
// oxlint-disable-next-line typescript/no-empty-object-type -- the emptiness is the mechanism: only an interface merges, and it starts with no keys because the steps are the project's to name
export interface StepRegistry {}

/**
 * Notice type to its payload. A notice is a fact recorded during the run, so its payload is the
 * fact's detail; declare `void` for one that carries nothing.
 */
// oxlint-disable-next-line typescript/no-empty-object-type -- see StepRegistry
export interface NoticeRegistry {}

/**
 * Intent type to its payload.
 *
 * The payload is declared directly rather than wrapped in a contract object, because the terse form
 * is what people actually write. An intent that one day needs to hand a *result* back gets a second
 * registry rather than a new shape here: changing this one would break every augmentation already
 * written against it.
 */
// oxlint-disable-next-line typescript/no-empty-object-type -- see StepRegistry
export interface IntentRegistry {}

/**
 * What a mounted step can reach into the framework with.
 *
 * This is the seam the whole two-phase design turns on. A preflight step runs before anything is
 * mounted and therefore has no port at all; a mounted step is run by a binding, which supplies this
 * object. Declare here only what the framework layer can genuinely do.
 */
// oxlint-disable-next-line typescript/no-empty-object-type -- see StepRegistry
export interface HostCapabilities {}

/**
 * The id every door accepts: the declared names **and** any other string, so declaring one step
 * does not make every undeclared one an error.
 *
 * **`(string & {})` is what keeps both halves.** A plain `keyof StepRegistry | string` collapses to
 * `string` and the editor stops completing the names; the branded member survives that reduction
 * long enough to be suggested.
 *
 * It is also why the generated reference shows every signature that takes an id as `string & {}`
 * rather than as this alias. Those pages are built from *this* package, where nothing has been
 * augmented, so `keyof StepRegistry` is `never` and TypeScript reduces the union to its surviving
 * half before the documenter ever sees a node. In a project that has declared its steps the same
 * signature reads `'session' | 'config' | (string & {})`: the declared names first, then the
 * escape hatch that keeps the undeclared ones legal.
 */
// oxlint-disable-next-line typescript/no-redundant-type-constituents -- `never` only while nobody has augmented; it becomes the union of declared ids, which is the whole mechanism
export type StepId = keyof StepRegistry | (string & {});

/** Notice types, declared and otherwise. Same mechanism as {@link StepId}. */
// oxlint-disable-next-line typescript/no-redundant-type-constituents -- see StepId
export type NoticeType = keyof NoticeRegistry | (string & {});

/** Intent types, declared and otherwise. Same mechanism as {@link StepId}. */
// oxlint-disable-next-line typescript/no-redundant-type-constituents -- see StepId
export type IntentType = keyof IntentRegistry | (string & {});

/**
 * What a step with this id resolves with, or `unknown` for an id the registry does not name.
 *
 * `unknown` rather than `any` on purpose: an undeclared step still forces the reader to narrow,
 * which is the nudge toward declaring it.
 */
export type DataOf<TId> = TId extends keyof StepRegistry ? StepRegistry[TId] : unknown;

/**
 * The argument list that follows a type, for the emitters that take an optional payload.
 *
 * Three cases, and the middle one is the reason this is a rest tuple rather than an overload: a
 * declared payload is **required**, a type declared as `void` takes none at all, and an undeclared
 * type takes an optional `unknown`. The type parameter is inferred from the emitter's first
 * parameter, which is fixed — a conditional over the rest alone has nothing to infer from and stays
 * deferred forever.
 */
export type PayloadArgs<TType, TRegistry> = TType extends keyof TRegistry
  ? [TRegistry[TType]] extends [void]
    ? []
    : [payload: TRegistry[TType]]
  : [payload?: unknown];
