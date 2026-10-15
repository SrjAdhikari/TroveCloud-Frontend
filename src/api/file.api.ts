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
 * Upload step 1: reserves space and gets a link to upload the file to.
 * The link only works for this exact file name and size.
 */
export const createUploadTicket = async (file: File, parentDirId?: string) => {
	const url = parentDirId ? `/files/${parentDirId}` : "/files";
	const { data } = await axiosClient.post<
		ApiSuccessResponse<UploadTicketPayload>
	>(url, { name: file.name, size: file.size });
	return data;
};

/**
 * Upload step 2: sends the file straight to storage using plain axios.
 * Our axiosClient adds cookies and settings that would make the link fail.
 */
export const uploadFileToR2 = async (
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
 * Upload step 3: checks the stored file and marks it ready. Safe to retry
 * if it fails.
 */
export const confirmUpload = async (fileId: string, signal?: AbortSignal) => {
	const { data } = await axiosClient.post<ApiSuccessResponse<FileItemPayload>>(
		`/files/${fileId}/confirm`,
		undefined,
		{ signal, timeout: CONFIRM_TIMEOUT_MS },
	);
	return data;
};

/** Cancels an upload, deleting the stored file and freeing its space. */
export const cancelUpload = async (fileId: string) => {
	const { data } = await axiosClient.post<ApiSuccessResponse>(
		`/files/${fileId}/cancel`,
	);
	return data;
};

/**
 * Gets a short-lived link to the file. Pass "download" to save it, or leave
 * it out to view it in the browser.
 */
export const getFileDownloadUrl = async (
	fileId: string,
	action?: "download",
) => {
	const { data } = await axiosClient.get<
		ApiSuccessResponse<DownloadUrlPayload>
	>(`/files/${fileId}/download-url`, {
		params: action ? { action } : undefined,
	});
	return data;
};

export const renameFile = async (fileId: string, newFileName: string) => {
	const { data } = await axiosClient.patch<ApiSuccessResponse<FileItemPayload>>(
		`/files/${fileId}`,
		{ newFileName },
	);
	return data;
};

export const deleteFile = async (fileId: string) => {
	const { data } = await axiosClient.delete<ApiSuccessResponse>(
		`/files/${fileId}`,
	);
	return data;
};
