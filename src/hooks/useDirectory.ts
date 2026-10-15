//* src/hooks/useDirectory.ts

import { useMutation, useQuery } from "@tanstack/react-query";
import {
	getDirectory,
	createDirectory,
	renameDirectory,
	deleteDirectory,
} from "@/api/directory.api";

/**
 * Gets the files and folders inside a folder.
 * With no `dirId`, gets the user's top-level folder.
 */
export const useCurrentDirectory = (dirId?: string) => {
	return useQuery({
		queryKey: ["directory", dirId],
		queryFn: () => getDirectory(dirId),
	});
};

export const useCreateDirectory = () => {
	return useMutation({
		mutationFn: ({
			name,
			parentDirId,
		}: {
			name: string;
			parentDirId?: string;
		}) => createDirectory(name, parentDirId),
	});
};

export const useRenameDirectory = () => {
	return useMutation({
		mutationFn: ({
			dirId,
			newDirName,
		}: {
			dirId: string;
			newDirName: string;
		}) => renameDirectory(dirId, newDirName),
	});
};

/** Deletes a folder and everything inside it. */
export const useDeleteDirectory = () => {
	return useMutation({
		mutationFn: deleteDirectory,
	});
};
