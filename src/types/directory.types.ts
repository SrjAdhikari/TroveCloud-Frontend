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
	folderCount?: number;
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

// A single breadcrumb crumb — one node on the root → current trail
export interface DirectoryCrumbPayload {
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
	// Root → current folder, self-inclusive (last crumb = this directory)
	breadcrumb: DirectoryCrumbPayload[];
	path: string;
	files: FileItemPayload[];
	childDirectories: DirectoryItemPayload[];
}
