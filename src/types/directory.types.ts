//* src/types/directory.types.ts

/**
 * Types for directory and file API responses.
 * These mirror the shapes returned by the backend's directory and file endpoints.
 */

// A child directory as it appears inside a directory listing
export interface DirectoryItemPayload {
	_id: string;
	name: string;
	parentDirId: string | null;
	userId: string;
	fileCount?: number;
	totalSize?: number;
	createdAt: string;
	updatedAt: string;
}

// A file as it appears inside a directory listing
export interface FileItemPayload {
	_id: string;
	name: string;
	extension: string;
	size?: number;
	parentDirId: string;
	userId: string;
	createdAt: string;
	updatedAt: string;
}

// A breadcrumb ancestor entry — root → immediate parent of the current dir
export interface DirectoryAncestorPayload {
	_id: string;
	name: string;
}

// Full directory contents returned by GET /api/directories/:id?
export interface DirectoryContentsPayload {
	_id: string;
	name: string;
	parentDirId: string | null;
	userId: string;
	fileCount?: number;
	totalSize?: number;
	ancestors: DirectoryAncestorPayload[];
	files: FileItemPayload[];
	childDirectories: DirectoryItemPayload[];
}
