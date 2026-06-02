import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple CSS class names safely using clsx and tailwind-merge
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
