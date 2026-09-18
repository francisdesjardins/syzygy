import { thrownMessage } from './thrown-message.js';

/**
 * Coerces an unknown thrown value to an `Error` instance.
 *
 * Pass-through for real `Error` objects. Anything else is wrapped: a string, number, boolean,
 * bigint, `null` or `undefined` becomes the message, and every other value reports
 * `Non-error thrown` rather than a coercion that says `[object Object]` or throws outright.
 *
 * @example
 * try {
 *   await risky();
 * } catch (thrown) {
 *   // `thrown` is `unknown`, and a string or a number is a legal throw.
 *   log(normalizeError(thrown).message);
 * }
 */
export function normalizeError(err: unknown): Error {
  return err instanceof Error ? err : new Error(thrownMessage(err));
}
