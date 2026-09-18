import { test, expect } from '@playwright/test';
import { normalizeError } from '../normalize-error.js';

test.describe('normalizeError', () => {
  test('passes Error instances through unchanged (same reference)', () => {
    const err = new Error('original');
    expect(normalizeError(err)).toBe(err);
  });

  test('preserves subclass instances (e.g. TypeError)', () => {
    const err = new TypeError('type error');
    expect(normalizeError(err)).toBe(err);
  });

  test('wraps a string in a new Error', () => {
    const result = normalizeError('oops');
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('oops');
  });

  test('wraps a number', () => {
    const result = normalizeError(42);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('42');
  });

  test('wraps null with message "null"', () => {
    const result = normalizeError(null);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('null');
  });

  test('wraps undefined with message "undefined"', () => {
    const result = normalizeError(undefined);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('undefined');
  });

  test('says a plain object is not an error rather than "[object Object]"', () => {
    const result = normalizeError({ code: 'E001' });
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('Non-error thrown');
  });

  /**
   * Both of these threw out of `String(value)`, from inside the handler that exists to report a
   * failure — so the thrown value replaced the one the caller was told about.
   */
  test('survives a value with no prototype', () => {
    const result = normalizeError(Object.create(null));
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('Non-error thrown');
  });

  test('survives a toString that throws', () => {
    const result = normalizeError({
      toString: () => {
        throw new Error('refused');
      },
    });
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('Non-error thrown');
  });
});
