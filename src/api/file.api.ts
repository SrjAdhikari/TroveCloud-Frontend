//* src/api/file.api.ts

import axiosClient from "@/config/axiosClient";
import type { ApiSuccessResponse } from "@/types/api.types";
import type {
	DownloadUrlPayload,
	FileItemPayload,
} from "@/types/directory.types";

/**
 * Uploads a file as a raw binary stream.
 * The backend expects the file body (not multipart) with a `filename` header.
 * Accepts optional onUploadProgress callback and AbortSignal for cancellation.
 */
const uploadFile = async (
	file: File,
	parentDirId?: string,
	onUploadProgress?: (progress: number) => void,
	signal?: AbortSignal,
) => {
	const url = parentDirId ? `/files/${parentDirId}` : "/files";
	const { data } = await axiosClient.post<ApiSuccessResponse<FileItemPayload>>(
		url,
		file,
		{
			headers: {
				"Content-Type": file.type || "application/octet-stream",
				filename: encodeURIComponent(file.name), // To handle special characters in file names
			},
			onUploadProgress: (event) => {
				if (event.total && onUploadProgress) {
					const percent = Math.round((event.loaded / event.total) * 100);
					onUploadProgress(percent);
				}
			},
			signal,
		},
	);
	return data;
};

/**
 * Creates a short-lived signed URL served directly by R2.
 * Pass "download" to force an attachment; omit it to preview inline.
 */
const getFileDownloadUrl = async (fileId: string, action?: "download") => {
	const { data } = await axiosClient.get<
		ApiSuccessResponse<DownloadUrlPayload>
	>(`/files/${fileId}/download-url`, {
		params: action ? { action } : undefined,
	});
	return data;
};

/**
 * Renames a file by its ID.
 */
const renameFile = async (fileId: string, newFileName: string) => {
	const { data } = await axiosClient.patch<ApiSuccessResponse<FileItemPayload>>(
		`/files/${fileId}`,
		{ newFileName },
	);
	return data;
};

/**
 * Deletes a file by its ID.
 */
const deleteFile = async (fileId: string) => {
	const { data } = await axiosClient.delete<ApiSuccessResponse>(
		`/files/${fileId}`,
	);
	return data;
};

export { uploadFile, getFileDownloadUrl, renameFile, deleteFile };
