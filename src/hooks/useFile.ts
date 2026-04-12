//* src/hooks/useFile.ts

import { useMutation } from "@tanstack/react-query";
import {
	uploadFile,
	downloadFile,
	renameFile,
	deleteFile,
} from "@/api/file.api";

/**
 * Mutation hook for uploading a file as a raw binary stream.
 */
const useUploadFile = () => {
	return useMutation({
		mutationFn: ({ file, parentDirId }: { file: File; parentDirId?: string }) =>
			uploadFile(file, parentDirId),
	});
};

/**
 * Mutation hook for downloading a file by its ID.
 * Returns a Blob for triggering a browser download.
 */
const useDownloadFile = () => {
	return useMutation({ mutationFn: downloadFile });
};

/**
 * Mutation hook for renaming a file.
 */
const useRenameFile = () => {
	return useMutation({
		mutationFn: ({
			fileId,
			newFileName,
		}: {
			fileId: string;
			newFileName: string;
		}) => renameFile(fileId, newFileName),
	});
};

/**
 * Mutation hook for deleting a file.
 */
const useDeleteFile = () => {
	return useMutation({ mutationFn: deleteFile });
};

export { useUploadFile, useDownloadFile, useRenameFile, useDeleteFile };
