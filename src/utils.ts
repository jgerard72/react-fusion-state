/**
 * Format error messages - simplified version
 */
export const formatErrorMessage = (
  message: string,
  ...values: string[]
): string => {
  return values.reduce(
    (msg, value, index) => msg.replace(`{${index}}`, value),
    message,
  );
};

/**
 * Simplified debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
) {
  let timer: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Simplified deep clone
 */
export const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

/**
 * Custom lightweight deep equality check
 * Optimized for React Fusion State use cases - replaces lodash.isequal
 */
export const customIsEqual = (a: unknown, b: unknown): boolean => {
  // Same reference or primitive equality
  if (a === b) return true;

  // Null/undefined checks
  if (a == null || b == null) return a === b;

  // Different types
  if (typeof a !== typeof b) return false;

  // Primitives that aren't equal
  if (typeof a !== 'object') return false;

  // Arrays
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!customIsEqual(a[i], b[i])) return false;
    }
    return true;
  }

  // Not arrays but one is
  if (Array.isArray(b)) return false;

  // Objects
  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!customIsEqual((a as any)[key], (b as any)[key])) return false;
  }

  return true;
};

/**
 * Optimized deep comparison
 */
export const simpleDeepEqual = (a: unknown, b: unknown): boolean =>
  a === b || customIsEqual(a, b);
