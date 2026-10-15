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
	contentType: string;
	size?: number;
	parentDirId: string;
	userId: string;
	createdAt: string;
	updatedAt: string;
}

// One folder in the path from the top folder to the current one
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
	breadcrumb: DirectoryCrumbPayload[];
	path: string;
	files: FileItemPayload[];
	childDirectories: DirectoryItemPayload[];
}

// POST /api/files/:parentDirId? — gets a link to upload the file to
export interface UploadTicketPayload {
	fileId: string;
	uploadUrl: string;
	contentType: string;
	expiresAt: string;
	uploadExpiresAt: string;
}

// GET /api/files/:id/download-url — gets a short-lived link to the file
export interface DownloadUrlPayload {
	url: string;
	expiresAt: string;
}
