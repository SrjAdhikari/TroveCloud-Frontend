//* src/hooks/useFileUpload.ts

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import toast from "@/lib/toast";
import { MAX_FILE_SIZE_LABEL } from "@/lib/constants";
import {
	cancelUpload,
	confirmUpload,
	createUploadTicket,
	uploadFileToR2,
} from "@/api/file.api";

const MINT_ERROR_MESSAGES: Record<string, string> = {
	FILE_TOO_LARGE: `File is too large. Please upload a file smaller than ${MAX_FILE_SIZE_LABEL}.`,
	STORAGE_LIMIT_EXCEEDED:
		"You don't have enough storage left for this file. Free up some space and try again.",
	DIRECTORY_NOT_FOUND:
		"We couldn't find the destination folder. Please try again or choose a different location.",
	VALIDATION_ERROR:
		"Something went wrong while uploading your file. Please check the file and try again.",
	INVALID_INPUT:
		"This file needs a proper extension, like .pdf or .png. Please rename it and try again.",
	INVALID_ID:
		"We couldn't process your upload due to a system issue. Please try again in a moment.",
	RATE_LIMITED:
		"You've started too many uploads at once. Please wait a moment and try again.",
};

const MINT_FALLBACK_MESSAGE =
	"We couldn't start your upload. Please try again.";

const CONFIRM_ERROR_MESSAGES: Record<string, string> = {
	UPLOAD_INCOMPLETE:
		"Your file didn't finish uploading. Please upload it again.",
	UPLOAD_OBJECT_MISMATCH:
		"The stored file didn't match what we reserved. Please upload it again.",
	UPLOAD_ALREADY_CONFIRMED:
		"This upload was already finished and the stored file no longer matches. Please upload it again.",
	FILE_NOT_FOUND:
		"We couldn't find this upload any more. Please upload the file again.",
	UPLOAD_CANCELLED: "This upload was cancelled. Please start a new upload.",
	RATE_LIMITED:
		"You've started too many uploads at once. Please wait a moment and try again.",
};

const CONFIRM_FALLBACK_MESSAGE =
	"We couldn't finish your upload. Please try again.";

const CONFIRM_RETRY_CODES = ["RATE_LIMITED", "NETWORK_ERROR"];
const CONFIRM_RETRY_DELAYS = [1000, 2000];
const SUCCESS_DISMISS_DELAY = 2000;

type UploadStep = "mint" | "put" | "confirm";

const readErrorCode = (error: unknown) =>
	(error as { code?: string })?.code ?? "";

const readStatus = (error: unknown) =>
	(error as { response?: { status?: number } })?.response?.status;

/**
 * A chain of confirmations to ensure they run one at a time.
 * Process-wide — every enqueued confirm must be left settled or the chain stalls.
 */
let confirmChain: Promise<void> = Promise.resolve();

const enqueueConfirm = <T>(task: () => Promise<T>) => {
	const result = confirmChain.then(task);
	confirmChain = result.then(
		() => undefined,
		() => undefined,
	);
	return result;
};

/** Resolves after ms, or immediately if the signal is or becomes aborted. */
const sleep = (ms: number, signal: AbortSignal) =>
	new Promise<void>((resolve) => {
		if (signal.aborted) return resolve();

		const done = () => {
			clearTimeout(timer);
			signal.removeEventListener("abort", done);
			resolve();
		};

		const timer = setTimeout(done, ms);
		signal.addEventListener("abort", done, { once: true });
	});

const confirmWithRetry = async (fileId: string, signal: AbortSignal) => {
	for (let attempt = 0; ; attempt++) {
		if (signal.aborted) throw signal.reason;

		try {
			return await confirmUpload(fileId, signal);
		} catch (error) {
			const retryable =
				attempt < CONFIRM_RETRY_DELAYS.length &&
				CONFIRM_RETRY_CODES.includes(readErrorCode(error));

			if (!retryable) throw error;

			await sleep(CONFIRM_RETRY_DELAYS[attempt], signal);
		}
	}
};

const cancelPendingFile = (fileId: string) => {
	cancelUpload(fileId).catch(() => undefined);
};

const resolveUploadError = (step: UploadStep, error: unknown) => {
	if (step === "put") {
		const expired = readStatus(error) === 403;
		return {
			message: expired
				? "This upload link expired before the file finished. Please upload it again."
				: "The file couldn't be transferred. Please check your connection and try again.",
			mapped: expired,
		};
	}

	const messages =
		step === "mint" ? MINT_ERROR_MESSAGES : CONFIRM_ERROR_MESSAGES;
	const fallback =
		step === "mint" ? MINT_FALLBACK_MESSAGE : CONFIRM_FALLBACK_MESSAGE;
	const code = readErrorCode(error);
	const mapped = code in messages;

	return { message: mapped ? messages[code] : fallback, mapped };
};

type UploadStatus =
	| "reserving"
	| "uploading"
	| "confirming"
	| "success"
	| "error";

interface UploadItem {
	id: string;
	fileName: string;
	progress: number;
	status: UploadStatus;
	errorMessage?: string;
}

/** A hook for uploading files to R2, with progress tracking and error handling. */
const useFileUpload = (dirId?: string) => {
	const queryClient = useQueryClient();
	const [uploads, setUploads] = useState<UploadItem[]>([]);

	const abortControllers = useRef(new Map<string, AbortController>());
	const dismissTimers = useRef(
		new Map<string, ReturnType<typeof setTimeout>>(),
	);

	useEffect(() => {
		const controllers = abortControllers.current;
		const timers = dismissTimers.current;

		return () => {
			controllers.forEach((controller) => controller.abort());
			controllers.clear();
			timers.forEach((timer) => clearTimeout(timer));
			timers.clear();
		};
	}, []);

	const patch = useCallback((id: string, changes: Partial<UploadItem>) => {
		setUploads((prev) =>
			prev.map((item) => (item.id === id ? { ...item, ...changes } : item)),
		);
	}, []);

	const dismiss = useCallback((id: string) => {
		const timer = dismissTimers.current.get(id);
		if (timer !== undefined) {
			clearTimeout(timer);
			dismissTimers.current.delete(id);
		}

		setUploads((prev) => prev.filter((item) => item.id !== id));
	}, []);

	/** Aborts the upload, which also stops its state machine. */
	const cancel = useCallback(
		(id: string) => {
			abortControllers.current.get(id)?.abort();
			abortControllers.current.delete(id);
			dismiss(id);
		},
		[dismiss],
	);

	const upload = useCallback(
		(files: FileList) => {
			Array.from(files).forEach(async (file) => {
				const id = crypto.randomUUID();
				const controller = new AbortController();
				abortControllers.current.set(id, controller);

				setUploads((prev) => [
					...prev,
					{ id, fileName: file.name, progress: 0, status: "reserving" },
				]);

				let step: UploadStep = "mint";
				let fileId: string | undefined;

				try {
					const ticket = await createUploadTicket(file, dirId);
					fileId = ticket.data.fileId;

					// Quota commits at mint, not confirm.
					if (controller.signal.aborted) {
						cancelPendingFile(fileId);
						queryClient.invalidateQueries({ queryKey: ["storageUsage"] });
						return;
					}

					step = "put";
					patch(id, { status: "uploading" });

					await uploadFileToR2(ticket.data.uploadUrl, file, {
						contentType: ticket.data.contentType,
						onProgress: (progress) => patch(id, { progress }),
						signal: controller.signal,
					});

					if (controller.signal.aborted) {
						cancelPendingFile(fileId);
						queryClient.invalidateQueries({ queryKey: ["storageUsage"] });
						return;
					}

					step = "confirm";
					patch(id, { status: "confirming", progress: 100 });

					await enqueueConfirm(async () => {
						if (controller.signal.aborted) return;
						await confirmWithRetry(ticket.data.fileId, controller.signal);
					});

					// The server may have committed the upload before the abort landed.
					if (controller.signal.aborted) {
						cancelPendingFile(fileId);
						queryClient.invalidateQueries({ queryKey: ["directory"] });
						queryClient.invalidateQueries({ queryKey: ["storageUsage"] });
						return;
					}

					abortControllers.current.delete(id);
					patch(id, { status: "success" });

					queryClient.invalidateQueries({ queryKey: ["directory"] });
					queryClient.invalidateQueries({ queryKey: ["storageUsage"] });

					const timer = setTimeout(() => {
						dismissTimers.current.delete(id);
						dismiss(id);
					}, SUCCESS_DISMISS_DELAY);
					dismissTimers.current.set(id, timer);
				} catch (error) {
					abortControllers.current.delete(id);

					if (step !== "mint" || controller.signal.aborted) {
						queryClient.invalidateQueries({ queryKey: ["storageUsage"] });
					}

					if (controller.signal.aborted) {
						if (fileId) cancelPendingFile(fileId);

						// An issued confirm may still have committed before the abort landed.
						if (step === "confirm") {
							queryClient.invalidateQueries({ queryKey: ["directory"] });
						}
						return;
					}

					const { message, mapped } = resolveUploadError(step, error);

					patch(id, { status: "error", errorMessage: message });

					if (!mapped) toast.error(message);
				}
			});
		},
		[dirId, dismiss, patch, queryClient],
	);

	return { uploads, upload, dismiss, cancel };
};

export type { UploadItem };

export default useFileUpload;
