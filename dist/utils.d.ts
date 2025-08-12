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
 * Optimized deep comparison
 */
export declare const simpleDeepEqual: (a: unknown, b: unknown) => boolean;
