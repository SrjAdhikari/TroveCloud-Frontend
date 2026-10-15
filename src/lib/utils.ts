//* src/lib/utils.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Joins class names and drops Tailwind classes that clash. */
const cn = (...inputs: ClassValue[]) => {
	return twMerge(clsx(inputs));
};

export default cn;
