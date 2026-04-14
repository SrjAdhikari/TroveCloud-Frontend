//* src/hooks/useFileUpload.ts

import { useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { uploadFile } from "@/api/file.api";

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
	const [uploads, setUploads] = useState<UploadItem[]>([]);
	const abortControllers = useRef<Map<string, AbortController>>(new Map());
	const queryClient = useQueryClient();

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

				// Create a new AbortController for each file
				// This allows us to cancel individual uploads independently
				const controller = new AbortController();
				abortControllers.current.set(id, controller);

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
						controller.signal,
					);

					abortControllers.current.delete(id);
					setUploads((prev) =>
						prev.map((item) =>
							item.id === id
								? { ...item, progress: 100, status: "success" }
								: item,
						),
					);
					queryClient.invalidateQueries({ queryKey: ["directory"] });
					setTimeout(() => {
						setUploads((prev) => prev.filter((item) => item.id !== id));
					}, 2000);
				} catch (error) {
					abortControllers.current.delete(id);
					if (controller.signal.aborted) return;

					const message =
						(error as { message?: string })?.message ||
						`Failed to upload ${file.name}`;
					setUploads((prev) =>
						prev.map((item) =>
							item.id === id
								? { ...item, status: "error", errorMessage: message }
								: item,
						),
					);
					toast.error(message);
				}
			});
		},
		[dirId, queryClient],
	);

	return { uploads, upload, dismiss, cancel };
};

export type { UploadItem };

export default useFileUpload;
