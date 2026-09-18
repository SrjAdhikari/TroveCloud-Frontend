//* src/api/file.api.ts

import axios from "axios";

import axiosClient from "@/config/axiosClient";
import type { ApiSuccessResponse } from "@/types/api.types";
import type {
	DownloadUrlPayload,
	FileItemPayload,
	UploadTicketPayload,
} from "@/types/directory.types";

const CONFIRM_TIMEOUT_MS = 30000;

/**
 * Step 1 of an upload — reserves quota and mints a presigned R2 PUT target.
 * The URL is signed to this exact name and size.
 */
const createUploadTicket = async (
	file: File,
	parentDirId?: string,
	signal?: AbortSignal,
) => {
	const url = parentDirId ? `/files/${parentDirId}` : "/files";
	const { data } = await axiosClient.post<
		ApiSuccessResponse<UploadTicketPayload>
	>(url, { name: file.name, size: file.size }, { signal });
	return data;
};

/**
 * Step 2 of an upload — sends the bytes straight to R2 on a bare axios call.
 * axiosClient's cookies, JSON default and interceptor all break the signature.
 */
const uploadFileToR2 = async (
	uploadUrl: string,
	file: File,
	options: {
		contentType: string;
		onProgress?: (percent: number) => void;
		signal?: AbortSignal;
	},
) => {
	await axios.put(uploadUrl, file, {
		headers: { "Content-Type": options.contentType },
		signal: options.signal,
		onUploadProgress: (event) => {
			if (event.total && options.onProgress) {
				options.onProgress(Math.round((event.loaded / event.total) * 100));
			}
		},
	});
};

/**
 * Step 3 of an upload — verifies the stored object and promotes it to ready.
 * Idempotent, so it is safe to retry after a failed confirm.
 */
const confirmUpload = async (fileId: string, signal?: AbortSignal) => {
	const { data } = await axiosClient.post<ApiSuccessResponse<FileItemPayload>>(
		`/files/${fileId}/confirm`,
		undefined,
		{ signal, timeout: CONFIRM_TIMEOUT_MS },
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

export {
	createUploadTicket,
	uploadFileToR2,
	confirmUpload,
	getFileDownloadUrl,
	renameFile,
	deleteFile,
};
