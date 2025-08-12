import isEqual from 'lodash.isequal';

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
 * Optimized deep comparison
 */
export const simpleDeepEqual = (a: unknown, b: unknown): boolean =>
  a === b || isEqual(a, b);
