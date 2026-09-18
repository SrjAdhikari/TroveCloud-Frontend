//* src/hooks/useFile.ts

import { useMutation, useQuery } from "@tanstack/react-query";
import { getFileDownloadUrl, renameFile, deleteFile } from "@/api/file.api";

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
	useFilePreviewUrl,
	useDownloadFile,
	useRenameFile,
	useDeleteFile,
};
