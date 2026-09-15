import { expect, test } from '@playwright/test';
import { normalizeError } from '../normalize-error.js';

/**
 * `throw` accepts anything, and the timeline has to survive all of it.
 *
 * The non-`Error` cases below are the ones the function exists for: `JSON.stringify(new Error('x'))`
 * is `{}`, and code throws strings and numbers often enough that the runner cannot assume it caught
 * an `Error`. Each shape is asserted rather than assumed.
 */

test('an Error keeps its name and message', () => {
  const normalized = normalizeError(new TypeError('bad shape'));

  expect(normalized.name).toBe('TypeError');
  expect(normalized.message).toBe('bad shape');
  expect(typeof normalized.stack).toBe('string');
});

test('a thrown string becomes an Error carrying it as the message', () => {
  expect(normalizeError('nope')).toEqual({ name: 'Error', message: 'nope' });
});

test('thrown numbers, booleans and bigints are stringified rather than dropped', () => {
  expect(normalizeError(404)).toEqual({ name: 'Error', message: '404' });
  expect(normalizeError(false)).toEqual({ name: 'Error', message: 'false' });
  expect(normalizeError(7n)).toEqual({ name: 'Error', message: '7' });
});

test('null and undefined say which of the two they were', () => {
  expect(normalizeError(null)).toEqual({ name: 'Error', message: 'null' });
  expect(normalizeError(undefined)).toEqual({ name: 'Error', message: 'undefined' });
});

test('anything else admits it was not an error', () => {
  expect(normalizeError({ status: 500 })).toEqual({ name: 'Error', message: 'Non-error thrown' });
});

test('a cause is followed', () => {
  const normalized = normalizeError(new Error('outer', { cause: new Error('inner') }));

  expect(normalized.cause?.message).toBe('inner');
});

test('a cause chain stops before it can run forever', () => {
  // Ten deep, against a cap of eight: the point is that it terminates, not where exactly it stops.
  let error = new Error('depth-10');
  for (let depth = 9; depth >= 0; depth -= 1) {
    error = new Error(`depth-${String(depth)}`, { cause: error });
  }

  let node = normalizeError(error);
  let seen = 0;
  while (node.cause !== undefined) {
    node = node.cause;
    seen += 1;
  }

  expect(seen).toBeLessThan(10);
});
