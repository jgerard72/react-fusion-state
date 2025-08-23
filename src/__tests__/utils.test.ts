import {
  simpleDeepEqual,
  debounce,
  formatErrorMessage,
  customIsEqual,
} from '../utils';

describe('utils', () => {
  it('simpleDeepEqual returns true for equal objects', () => {
    expect(simpleDeepEqual({a: 1, b: [1, 2]}, {a: 1, b: [1, 2]})).toBe(true);
  });

  it('simpleDeepEqual returns false for different objects', () => {
    expect(simpleDeepEqual({a: 1}, {a: 2})).toBe(false);
  });

  it('formatErrorMessage replaces placeholders', () => {
    expect(formatErrorMessage('Error: {0} - {1}', 'A', 'B')).toBe(
      'Error: A - B',
    );
  });

  it('debounce delays calls', done => {
    let calls = 0;
    const fn = debounce(() => {
      calls += 1;
    }, 50);
    fn();
    fn();
    setTimeout(() => {
      expect(calls).toBe(1);
      done();
    }, 80);
  });

  describe('customIsEqual', () => {
    it('returns true for same reference', () => {
      const obj = {a: 1};
      expect(customIsEqual(obj, obj)).toBe(true);
    });

    it('returns true for primitives', () => {
      expect(customIsEqual(42, 42)).toBe(true);
      expect(customIsEqual('hello', 'hello')).toBe(true);
      expect(customIsEqual(true, true)).toBe(true);
    });

    it('returns false for different primitives', () => {
      expect(customIsEqual(42, 43)).toBe(false);
      expect(customIsEqual('hello', 'world')).toBe(false);
      expect(customIsEqual(true, false)).toBe(false);
    });

    it('returns true for null/undefined', () => {
      expect(customIsEqual(null, null)).toBe(true);
      expect(customIsEqual(undefined, undefined)).toBe(true);
    });

    it('returns false for null vs undefined', () => {
      expect(customIsEqual(null, undefined)).toBe(false);
    });

    it('returns true for equal arrays', () => {
      expect(customIsEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(customIsEqual([{a: 1}], [{a: 1}])).toBe(true);
    });

    it('returns false for different arrays', () => {
      expect(customIsEqual([1, 2], [1, 3])).toBe(false);
      expect(customIsEqual([1, 2], [1, 2, 3])).toBe(false);
    });

    it('returns true for equal objects', () => {
      expect(customIsEqual({a: 1, b: 2}, {a: 1, b: 2})).toBe(true);
      expect(customIsEqual({a: {b: 1}}, {a: {b: 1}})).toBe(true);
    });

    it('returns false for different objects', () => {
      expect(customIsEqual({a: 1}, {a: 2})).toBe(false);
      expect(customIsEqual({a: 1, b: 2}, {a: 1})).toBe(false);
    });

    it('returns false for mixed types', () => {
      expect(customIsEqual(42, '42')).toBe(false);
      expect(customIsEqual([1, 2], {0: 1, 1: 2})).toBe(false);
    });
  });
});
