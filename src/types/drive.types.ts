//* src/types/drive.types.ts

/** Why a picked Drive item couldn't be imported. */
export type DriveImportFailureReason =
	| "DRIVE_ITEM_NOT_FOUND"
	| "UNSUPPORTED_DRIVE_TYPE"
	| "DRIVE_EXPORT_TOO_LARGE"
	| "DRIVE_IMPORT_LIMIT_EXCEEDED"
	| "INVALID_DRIVE_TOKEN"
	| "DRIVE_IMPORT_FAILED";

/**
 * An item the user picked in Google's file picker. The server only needs
 * `id` and `mimeType` to fetch it.
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
	name: string | null;
	reason: DriveImportFailureReason;
}

export interface DriveImportResult {
	imported: DriveImportedItem[];
	failed: DriveFailedItem[];
}
