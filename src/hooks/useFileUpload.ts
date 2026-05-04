//* src/hooks/useFileUpload.ts

import { useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import toast from "@/lib/toast";
import { uploadFile } from "@/api/file.api";
import { MAX_FILE_SIZE_LABEL } from "@/lib/constants";

/** Backend error codes mapped to user-facing copy shown in the upload progress panel. */
const UPLOAD_ERROR_MESSAGES: Record<string, string> = {
	FILE_TOO_LARGE: `File is too large. Please upload a file smaller than ${MAX_FILE_SIZE_LABEL}.`,
	DIRECTORY_NOT_FOUND: "We couldn't find the destination folder. Please try again or choose a different location.",
	INVALID_INPUT: "Something went wrong while uploading your file. Please check the file and try again.",
	INVALID_ID: "We couldn't process your upload due to a system issue. Please try again in a moment.",
};

interface UploadItem {
	id: string;
	fileName: string;
	progress: number;
	status: "uploading" | "success" | "error";
	errorMessage?: string;
}

/**
 * Manages concurrent file uploads with progress tracking and cancellation.
 * Each file gets its own AbortController so uploads can be cancelled independently.
 * Successful uploads auto-dismiss after 2 seconds.
 */
const useFileUpload = (dirId?: string) => {
	const queryClient = useQueryClient();
	const [uploads, setUploads] = useState<UploadItem[]>([]);

	/**
	 * useRef instead of useState because we need to read/write controllers
	 * synchronously (inside cancel) without triggering re-renders
	 */
	const abortControllers = useRef<Map<string, AbortController>>(new Map());

	/** Removes a completed/failed upload from the panel */
	const dismiss = useCallback((id: string) => {
		setUploads((prev) => prev.filter((item) => item.id !== id));
	}, []);

	/** Cancels an in-progress upload by aborting its request */
	const cancel = useCallback((id: string) => {
		const controller = abortControllers.current.get(id);
		if (controller) {
			controller.abort();
			abortControllers.current.delete(id);
		}
		setUploads((prev) => prev.filter((item) => item.id !== id));
	}, []);

	/**
	 * Uploads each selected file and tracks progress.
	 * Calls the API directly (not via useMutation) so multiple
	 * concurrent uploads each get independent success/error handling.
	 */
	const upload = useCallback(
		(files: FileList) => {
			Array.from(files).forEach(async (file) => {
				const id = crypto.randomUUID();

				/**
				 * Create a new AbortController for each file
				 * This allows us to cancel individual uploads independently
				 */
				const controller = new AbortController();
				abortControllers.current.set(id, controller);

				// Add the new upload to the state
				setUploads((prev) => [
					...prev,
					{ id, fileName: file.name, progress: 0, status: "uploading" },
				]);

				try {
					await uploadFile(
						file,
						dirId,
						(progress) => {
							setUploads((prev) =>
								prev.map((item) =>
									item.id === id && item.status === "uploading"
										? { ...item, progress }
										: item,
								),
							);
						},

						// Pass the AbortController signal to the uploadFile function
						controller.signal,
					);

					// Remove the AbortController from the map once the upload is complete
					abortControllers.current.delete(id);

					setUploads((prev) =>
						prev.map((item) =>
							item.id === id
								? { ...item, progress: 100, status: "success" }
								: item,
						),
					);

					// Invalidate the directory query to refresh the file list
					queryClient.invalidateQueries({ queryKey: ["directory"] });

					// Remove the upload from the panel after 2 seconds
					setTimeout(() => {
						setUploads((prev) => prev.filter((item) => item.id !== id));
					}, 2000);
				} catch (error) {
					// Remove the AbortController from the map once the upload is failed
					abortControllers.current.delete(id);

					/**
					 * If the user cancelled the upload, the abort throws an error —
					 * we don't want to show an error for a user-initiated action
					 */
					if (controller.signal.aborted) return;

					const code = (error as { code?: string })?.code;
					const isClientError = code !== undefined && code in UPLOAD_ERROR_MESSAGES;
					const message = isClientError
						? UPLOAD_ERROR_MESSAGES[code]
						: "Upload failed. Please try again.";

					setUploads((prev) =>
						prev.map((item) =>
							item.id === id
								? { ...item, status: "error", errorMessage: message }
								: item,
						),
					);

					// Per feedback patterns: 4xx client errors stay inline (panel row);
					// 5xx / network failures get an additional toast for visibility.
					if (!isClientError) toast.error(message);
				}
			});
		},
		[dirId, queryClient],
	);

	return { uploads, upload, dismiss, cancel };
};

export type { UploadItem };

export default useFileUpload;
