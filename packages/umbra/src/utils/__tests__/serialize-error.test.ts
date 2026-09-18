import { expect, test } from '@playwright/test';
import { serializeError } from '../serialize-error.js';

/**
 * `throw` accepts anything, and the timeline has to survive all of it.
 *
 * The non-`Error` cases below are the ones the function exists for: `JSON.stringify(new Error('x'))`
 * is `{}`, and code throws strings and numbers often enough that the runner cannot assume it caught
 * an `Error`. Each shape is asserted rather than assumed.
 */

test('an Error keeps its name and message', () => {
  const normalized = serializeError(new TypeError('bad shape'));

  expect(normalized.name).toBe('TypeError');
  expect(normalized.message).toBe('bad shape');
  expect(typeof normalized.stack).toBe('string');
});

test('a thrown string becomes an Error carrying it as the message', () => {
  expect(serializeError('nope')).toEqual({ name: 'Error', message: 'nope' });
});

test('thrown numbers, booleans and bigints are stringified rather than dropped', () => {
  expect(serializeError(404)).toEqual({ name: 'Error', message: '404' });
  expect(serializeError(false)).toEqual({ name: 'Error', message: 'false' });
  expect(serializeError(7n)).toEqual({ name: 'Error', message: '7' });
});

test('null and undefined say which of the two they were', () => {
  expect(serializeError(null)).toEqual({ name: 'Error', message: 'null' });
  expect(serializeError(undefined)).toEqual({ name: 'Error', message: 'undefined' });
});

test('anything else admits it was not an error', () => {
  expect(serializeError({ status: 500 })).toEqual({ name: 'Error', message: 'Non-error thrown' });
});

test('a value that refuses to be stringified is still reported', () => {
  // `String(value)` throws on both, which would replace the failure being recorded with a new one.
  expect(serializeError(Object.create(null))).toEqual({
    name: 'Error',
    message: 'Non-error thrown',
  });
  expect(
    serializeError({
      toString: () => {
        throw new Error('refused');
      },
    })
  ).toEqual({ name: 'Error', message: 'Non-error thrown' });
});

test('a cause is followed', () => {
  const normalized = serializeError(new Error('outer', { cause: new Error('inner') }));

  expect(normalized.cause?.message).toBe('inner');
});

test('a cause chain stops before it can run forever', () => {
  // Ten deep, against a cap of eight: the point is that it terminates, not where exactly it stops.
  let error = new Error('depth-10');
  for (let depth = 9; depth >= 0; depth -= 1) {
    error = new Error(`depth-${String(depth)}`, { cause: error });
  }

  let node = serializeError(error);
  let seen = 0;
  while (node.cause !== undefined) {
    node = node.cause;
    seen += 1;
  }

  expect(seen).toBeLessThan(10);
});
