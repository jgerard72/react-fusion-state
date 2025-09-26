import {batch} from '../utils/batch';

describe('batch utility', () => {
  test('should execute function', () => {
    let executed = false;

    batch(() => {
      executed = true;
    });

    expect(executed).toBe(true);
  });

  test('should handle function with return value', () => {
    let value = 0;
    batch(() => {
      value = 42;
      return value;
    });

    // batch should execute the function, but we check the side effect
    expect(value).toBe(42);
  });

  test('should handle exceptions', () => {
    expect(() => {
      batch(() => {
        throw new Error('Test error');
      });
    }).toThrow('Test error');
  });

  test('should be callable multiple times', () => {
    let count = 0;

    batch(() => count++);
    batch(() => count++);
    batch(() => count++);

    expect(count).toBe(3);
  });
});
