/**
 * Generates an array of indices from 0 to length-1.
 * Useful for mapping over a specific number of iterations in React components.
 * 
 * Uses memoization to avoid re-creating arrays on every call.
 * 
 * @param length - The length of the array to generate
 * @returns An array of indices [0, 1, 2, ..., length-1]
 * 
 * @example
 * ```tsx
 * {range(5).map((index) => <div key={index}>Item {index}</div>)}
 * // Renders: Item 0, Item 1, Item 2, Item 3, Item 4
 * ```
 */

const arrayCache = new Map<number, number[]>();

export function range(length: number): number[] {
  if (length < 0) {
    throw new Error('Range length must be non-negative');
  }

  if (!arrayCache.has(length)) {
    arrayCache.set(length, Array.from({ length }, (_, i) => i));
  }

  return arrayCache.get(length)!;
}

/**
 * Clears the array cache. Useful for testing or memory management.
 */
export function clearRangeCache(): void {
  arrayCache.clear();
}
