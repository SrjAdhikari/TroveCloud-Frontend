//* src/lib/utils.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function for merging Tailwind CSS classes
 * @param inputs - Array of Tailwind CSS class strings
 * @returns Merged Tailwind CSS class string
 */
const cn = (...inputs: ClassValue[]) => {
	return twMerge(clsx(inputs));
};

export default cn;
