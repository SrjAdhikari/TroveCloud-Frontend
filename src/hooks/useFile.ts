//* src/hooks/useFile.ts

import { useMutation, useQuery } from "@tanstack/react-query";
import { getFileDownloadUrl, renameFile, deleteFile } from "@/api/file.api";

/** Not cached: the link expires after an hour, so get a new one each time. */
export const useFilePreviewUrl = (fileId: string) => {
	return useQuery({
		queryKey: ["filePreviewUrl", fileId],
		queryFn: () => getFileDownloadUrl(fileId),
		gcTime: 0,
		refetchOnMount: "always",
		retry: false,
	});
};

export const useDownloadFile = () => {
	return useMutation({
		mutationFn: (fileId: string) => getFileDownloadUrl(fileId, "download"),
	});
};

export const useRenameFile = () => {
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

export const useDeleteFile = () => {
	return useMutation({ mutationFn: deleteFile });
};
