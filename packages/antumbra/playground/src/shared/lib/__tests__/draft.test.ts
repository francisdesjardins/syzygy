import { expect, test } from '@playwright/test';
import { produce } from '../draft';

test.describe('produce', () => {
  test('a flat write returns a new object and leaves the old one alone', () => {
    const before = { count: 0, label: 'a' };

    const after = produce(before, (draft) => {
      draft.count += 1;
    });

    expect(after).toEqual({ count: 1, label: 'a' });
    expect(before).toEqual({ count: 0, label: 'a' });
    expect(after).not.toBe(before);
  });

  test('reading without writing returns the object it was given', () => {
    const before = { nested: { deep: 1 } };

    const after = produce(before, (draft) => {
      // Read, and read into the branch: neither is a write, so neither may copy anything.
      expect(draft.nested.deep).toBe(1);
    });

    expect(after).toBe(before);
  });

  test('a nested write rebuilds the path to the root and nothing else', () => {
    const before = { touched: { value: 1 }, untouched: { value: 2 } };

    const after = produce(before, (draft) => {
      draft.touched.value = 99;
    });

    expect(after.touched.value).toBe(99);
    expect(before.touched.value).toBe(1);
    expect(after).not.toBe(before);
    expect(after.touched).not.toBe(before.touched);
    // The half nobody wrote to is the same object, which is what a memo upstream reads.
    expect(after.untouched).toBe(before.untouched);
  });

  test('two writes into one branch share a single copy', () => {
    const before = { group: { a: 1, b: 2 }, other: 0 };

    const after = produce(before, (draft) => {
      draft.group.a = 10;
      draft.group.b = 20;
    });

    expect(after.group).toEqual({ a: 10, b: 20 });
    expect(before.group).toEqual({ a: 1, b: 2 });
  });

  test('a write three levels down carries every level with it', () => {
    const before = { a: { b: { c: 1 } }, sibling: { keep: true } };

    const after = produce(before, (draft) => {
      draft.a.b.c = 2;
    });

    expect(after.a.b.c).toBe(2);
    expect(before.a.b.c).toBe(1);
    expect(after.a).not.toBe(before.a);
    expect(after.a.b).not.toBe(before.a.b);
    expect(after.sibling).toBe(before.sibling);
  });

  test('arrays are drafted too, by index and by replacement', () => {
    const before = { log: ['first', 'second'], id: 1 };

    const byIndex = produce(before, (draft) => {
      draft.log[0] = 'changed';
    });
    expect(byIndex.log).toEqual(['changed', 'second']);
    expect(before.log).toEqual(['first', 'second']);

    const byReplacement = produce(before, (draft) => {
      draft.log = ['new', ...draft.log.slice(0, 1)];
    });
    expect(byReplacement.log).toEqual(['new', 'first']);
    expect(before.log).toEqual(['first', 'second']);
  });

  test('a push reads the length off the copy rather than the base', () => {
    const before = { log: ['one'] };

    const after = produce(before, (draft) => {
      draft.log.push('two');
      draft.log.push('three');
    });

    expect(after.log).toEqual(['one', 'two', 'three']);
    expect(before.log).toEqual(['one']);
  });

  test('Object.assign over the draft writes every key', () => {
    const before = { name: '', region: '', step: 0 };

    const after = produce(before, (draft) => {
      Object.assign(draft, { name: 'atlas', region: 'ca-east' });
    });

    expect(after).toEqual({ name: 'atlas', region: 'ca-east', step: 0 });
    expect(before.name).toBe('');
  });

  test('spreading and enumerating a draft see what was written', () => {
    const before = { a: 1, b: 2 };

    const after = produce(before, (draft) => {
      draft.a = 9;
      expect(Object.keys(draft)).toEqual(['a', 'b']);
      expect({ ...draft }).toEqual({ a: 9, b: 2 });
      expect('a' in draft).toBe(true);
    });

    expect(after).toEqual({ a: 9, b: 2 });
  });

  test('a deleted key is gone from the copy and still on the base', () => {
    const before: { a: number; b?: number } = { a: 1, b: 2 };

    const after = produce(before, (draft) => {
      delete draft.b;
    });

    expect(after).toEqual({ a: 1 });
    expect(before).toEqual({ a: 1, b: 2 });
  });

  test('a recipe that writes nothing hands the base straight back', () => {
    const before = { a: 1 };

    expect(produce(before, () => {})).toBe(before);
  });

  test('what it is not drafting is handed over untouched', () => {
    const when = new Date(0);
    const before = {
      when,
      fn: () => {
        return 1;
      },
    };

    const after = produce(before, (draft) => {
      // A `Date` is not a plain object, so it arrives as itself rather than as a draft.
      expect(draft.when).toBe(when);
      draft.fn = () => {
        return 2;
      };
    });

    expect(after.when).toBe(when);
    expect(after.fn()).toBe(2);
  });
});
