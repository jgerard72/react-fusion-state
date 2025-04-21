/**
 * Formats error messages by replacing placeholders with actual values
 * @param message - Error message template with placeholders
 * @param values - Values to replace placeholders
 * @returns Formatted error message
 */
export declare const formatErrorMessage: (message: string, ...values: string[]) => string;
/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait time has elapsed since the last invocation.
 *
 * @param fn - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns A debounced version of the function
 */
export declare function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void;
/**
 * Creates a deep copy of an object using JSON serialization.
 * Note: This will lose functions and other non-serializable values.
 *
 * @param obj - The object to clone
 * @returns A deep copy of the object
 */
export declare function deepClone<T>(obj: T): T;
/**
 * Checks if two values are deeply equal using JSON stringification.
 * This is simpler than full deep equality but sufficient for many cases.
 *
 * @param a - First value
 * @param b - Second value
 * @returns True if values are deeply equal
 */
export declare function simpleDeepEqual(a: unknown, b: unknown): boolean;
