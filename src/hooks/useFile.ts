//* src/hooks/useFile.ts

import { useMutation, useQuery } from "@tanstack/react-query";
import {
	uploadFile,
	getFileDownloadUrl,
	renameFile,
	deleteFile,
} from "@/api/file.api";

/**
 * Mutation hook for uploading a file as a raw binary stream.
 * Accepts an optional onUploadProgress callback for tracking upload percentage.
 */
const useUploadFile = () => {
	return useMutation({
		mutationFn: ({
			file,
			parentDirId,
			onUploadProgress,
		}: {
			file: File;
			parentDirId?: string;
			onUploadProgress?: (progress: number) => void;
		}) => uploadFile(file, parentDirId, onUploadProgress),
	});
};

/**
 * Query hook for creating a signed URL to preview a file inline.
 * Never cached — the URL expires in an hour, so each mount creates a fresh one.
 */
const useFilePreviewUrl = (fileId: string) => {
	return useQuery({
		queryKey: ["filePreviewUrl", fileId],
		queryFn: () => getFileDownloadUrl(fileId),
		gcTime: 0,
		refetchOnMount: "always",
		retry: false,
	});
};

/**
 * Mutation hook for creating a signed download URL.
 * Returns the URL for the caller to hand to the browser.
 */
const useDownloadFile = () => {
	return useMutation({
		mutationFn: (fileId: string) => getFileDownloadUrl(fileId, "download"),
	});
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

export {
	useUploadFile,
	useFilePreviewUrl,
	useDownloadFile,
	useRenameFile,
	useDeleteFile,
};
