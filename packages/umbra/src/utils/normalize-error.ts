import type { SerializedError } from '../core/types.js';

/** How deep a `cause` chain is followed before it is treated as a cycle. */
const MAX_CAUSE_DEPTH = 8;

function describe(value: unknown): { name: string; message: string } {
  if (typeof value === 'string') {
    return { name: 'Error', message: value };
  }
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return { name: 'Error', message: String(value) };
  }
  if (value === null || value === undefined) {
    return { name: 'Error', message: String(value) };
  }
  return { name: 'Error', message: 'Non-error thrown' };
}

/**
 * Anything a `throw` can produce, flattened to something a log collector survives.
 *
 * Two things this exists for, and neither is cosmetic. `JSON.stringify(new Error('x'))` is `{}`,
 * so a timeline that held real errors would ship empty objects; and code throws strings, numbers
 * and plain objects often enough that the runner cannot assume it caught an `Error`.
 *
 * @example
 * // A step may throw anything at all; this is the shape the outcome records instead.
 * const failure = normalizeError('the token endpoint returned 500');
 * console.error(failure.name, failure.message);
 */
export function normalizeError(value: unknown, depth = 0): SerializedError {
  if (value instanceof Error) {
    const cause =
      depth < MAX_CAUSE_DEPTH && value.cause !== undefined && value.cause !== null
        ? normalizeError(value.cause, depth + 1)
        : undefined;
    return {
      name: value.name,
      message: value.message,
      ...(value.stack === undefined ? {} : { stack: value.stack }),
      ...(cause === undefined ? {} : { cause }),
    };
  }
  return describe(value);
}
