//* src/api/directory.api.ts

import axiosClient from "@/config/axiosClient";
import type { ApiSuccessResponse } from "@/types/api.types";
import type {
	DirectoryContentsPayload,
	DirectoryItemPayload,
} from "@/types/directory.types";

/**
 * Fetches the contents of a directory (files + child directories).
 * Defaults to the user's root directory if no ID is provided.
 */
const getDirectory = async (dirId?: string) => {
	const url = dirId ? `/directories/${dirId}` : "/directories";
	const { data } =
		await axiosClient.get<ApiSuccessResponse<DirectoryContentsPayload>>(url);
	return data;
};

/**
 * Creates a new directory inside the given parent.
 * Defaults to root if no parentDirId is provided.
 */
const createDirectory = async (name: string, parentDirId?: string) => {
	const url = parentDirId ? `/directories/${parentDirId}` : "/directories";
	const { data } = await axiosClient.post<
		ApiSuccessResponse<DirectoryItemPayload>
	>(url, { name });
	return data;
};

/**
 * Renames a directory by its ID.
 */
const renameDirectory = async (dirId: string, newDirName: string) => {
	const { data } = await axiosClient.patch<
		ApiSuccessResponse<DirectoryItemPayload>
	>(`/directories/${dirId}`, { newDirName });
	return data;
};

/**
 * Deletes a directory and all its contents recursively.
 */
const deleteDirectory = async (dirId: string) => {
	const { data } = await axiosClient.delete<ApiSuccessResponse>(
		`/directories/${dirId}`,
	);
	return data;
};

export { getDirectory, createDirectory, renameDirectory, deleteDirectory };
