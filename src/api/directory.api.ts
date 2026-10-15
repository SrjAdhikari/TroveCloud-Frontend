//* src/api/directory.api.ts

import axiosClient from "@/config/axiosClient";
import type { ApiSuccessResponse } from "@/types/api.types";
import type {
	DirectoryContentsPayload,
	DirectoryItemPayload,
} from "@/types/directory.types";

/**
 * Gets a folder's files and folders. With no `dirId`, gets the top-level
 * folder.
 */
export const getDirectory = async (dirId?: string) => {
	const url = dirId ? `/directories/${dirId}` : "/directories";
	const { data } =
		await axiosClient.get<ApiSuccessResponse<DirectoryContentsPayload>>(url);
	return data;
};

/** Creates a folder. With no `parentDirId`, it goes in the top-level folder. */
export const createDirectory = async (name: string, parentDirId?: string) => {
	const url = parentDirId ? `/directories/${parentDirId}` : "/directories";
	const { data } = await axiosClient.post<
		ApiSuccessResponse<DirectoryItemPayload>
	>(url, { name });
	return data;
};

export const renameDirectory = async (dirId: string, newDirName: string) => {
	const { data } = await axiosClient.patch<
		ApiSuccessResponse<DirectoryItemPayload>
	>(`/directories/${dirId}`, { newDirName });
	return data;
};

/** Deletes a folder and everything inside it. */
export const deleteDirectory = async (dirId: string) => {
	const { data } = await axiosClient.delete<ApiSuccessResponse>(
		`/directories/${dirId}`,
	);
	return data;
};
