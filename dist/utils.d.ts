/**
 * Format error messages - simplified version
 */
export declare const formatErrorMessage: (message: string, ...values: string[]) => string;
/**
 * Simplified debounce function
 */
export declare function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void;
/**
 * Simplified deep clone
 */
export declare const deepClone: <T>(obj: T) => T;
/**
 * Custom lightweight deep equality check
 * Optimized for React Fusion State use cases - replaces lodash.isequal
 */
export declare const customIsEqual: (a: unknown, b: unknown) => boolean;
/**
 * Shallow comparison for objects and arrays
 */
export declare const shallowEqual: (a: unknown, b: unknown) => boolean;
/**
 * Optimized deep comparison
 */
export declare const simpleDeepEqual: (a: unknown, b: unknown) => boolean;
