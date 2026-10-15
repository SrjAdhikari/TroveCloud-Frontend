//* src/types/storage.types.ts

/** Categories the server sorts files into, based on their extension. */
export type StorageCategory =
	| "Documents"
	| "Images"
	| "Videos"
	| "Audio"
	| "Archives"
	| "Other";

export interface StorageBreakdownItem {
	category: StorageCategory;
	size: number;
	icon: string;
}

export interface StorageUsage {
	used: number;
	total: number;
	breakdown: StorageBreakdownItem[];
}
