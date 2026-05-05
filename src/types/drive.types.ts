//* src/types/drive.types.ts

/**
 * Types for the Google Drive Import flow.
 */
export type DriveImportFailureReason =
	| "DRIVE_ITEM_NOT_FOUND"
	| "UNSUPPORTED_DRIVE_TYPE"
	| "DRIVE_EXPORT_TOO_LARGE"
	| "DRIVE_IMPORT_LIMIT_EXCEEDED"
	| "DRIVE_IMPORT_FAILED";

/**
 * A single item the user picked in the Google Picker.
 * `id` and `mimeType` are the only fields the backend needs to fetch + classify the item.
 */
export interface DrivePickedItem {
	id: string;
	mimeType: string;
}

export interface DriveImportPayload {
	accessToken: string;
	items: DrivePickedItem[];
	parentDirId?: string;
}

export interface DriveImportedItem {
	driveId: string;
	troveId: string;
	name: string;
	kind: "file" | "folder";
}

export interface DriveFailedItem {
	driveId: string;
	name: string;
	reason: DriveImportFailureReason;
}

export interface DriveImportResult {
	imported: DriveImportedItem[];
	failed: DriveFailedItem[];
}
