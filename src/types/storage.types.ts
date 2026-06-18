//* src/types/storage.types.ts

/** Categories the backend derives from file extensions */
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
