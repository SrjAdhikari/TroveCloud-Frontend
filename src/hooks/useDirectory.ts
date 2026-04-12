//* src/hooks/useDirectory.ts

import { useMutation, useQuery } from "@tanstack/react-query";
import {
	getDirectory,
	createDirectory,
	renameDirectory,
	deleteDirectory,
} from "@/api/directory.api";

/**
 * Query hook for fetching the contents of a directory.
 * Defaults to the user's root directory when no dirId is provided.
 */
const useCurrentDirectory = (dirId?: string) => {
	return useQuery({
		queryKey: ["directory", dirId],
		queryFn: () => getDirectory(dirId),
	});
};

/**
 * Mutation hook for creating a new directory.
 */
const useCreateDirectory = () => {
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

/**
 * Mutation hook for renaming a directory.
 */
const useRenameDirectory = () => {
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

/**
 * Mutation hook for deleting a directory and all its contents.
 */
const useDeleteDirectory = () => {
	return useMutation({
		mutationFn: deleteDirectory,
	});
};

export {
	useCurrentDirectory,
	useCreateDirectory,
	useRenameDirectory,
	useDeleteDirectory,
};
