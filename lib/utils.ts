import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * cn - Merge and deduplicate Tailwind CSS classes
 * 
 * Combines clsx for conditional classes with tailwind-merge
 * for proper Tailwind class precedence and deduplication.
 * 
 * @function cn
 * @param {...ClassValue} inputs - Class names, arrays, or conditionals
 * @returns {string} Merged and deduplicated class string
 * 
 * @example
 * ```tsx
 * // Basic usage
 * cn('px-4 py-2', 'bg-blue-500'); 
 * // Returns: "px-4 py-2 bg-blue-500"
 * 
 * // Conditional classes
 * cn('base-class', {
 *   'active-class': isActive,
 *   'disabled-class': isDisabled
 * });
 * 
 * // Override classes (tailwind-merge handles precedence)
 * cn('px-4', 'px-8'); 
 * // Returns: "px-8" (later class takes precedence)
 * 
 * // Array syntax
 * cn(['text-sm', 'font-bold'], condition && 'text-red-500');
 * ```
 * 
 * @since 1.0.0
 * @see {@link https://github.com/lukeed/clsx} - clsx documentation
 * @see {@link https://github.com/dcastil/tailwind-merge} - tailwind-merge documentation
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
