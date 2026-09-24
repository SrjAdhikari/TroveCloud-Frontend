//* tests/hooks/useFileUpload.test.tsx

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import toast from "@/lib/toast";
import useFileUpload from "@/hooks/useFileUpload";
import {
	cancelUpload,
	confirmUpload,
	createUploadTicket,
	uploadFileToR2,
} from "@/api/file.api";
import type { ApiSuccessResponse } from "@/types/api.types";
import type {
	FileItemPayload,
	UploadTicketPayload,
} from "@/types/directory.types";

// useFileUpload's confirm chain is module state: leave every enqueued confirm
// settled, or the next test in this file hangs waiting on it.

vi.mock("@/api/file.api");

vi.mock("@/lib/toast", () => ({
	default: {
		success: vi.fn(),
		error: vi.fn(),
		info: vi.fn(),
		warning: vi.fn(),
	},
}));

const makeWrapper = (client: QueryClient) => {
	return ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={client}>{children}</QueryClientProvider>
	);
};

const renderUpload = (client = new QueryClient()) =>
	renderHook(() => useFileUpload("dir-1"), { wrapper: makeWrapper(client) });

const makeFile = (name: string) =>
	new File(["bytes"], name, { type: "application/pdf" });

const asFileList = (...files: File[]) => files as unknown as FileList;

const ticketFor = (
	fileId: string,
): ApiSuccessResponse<UploadTicketPayload> => ({
	success: true,
	message: "Upload initiated successfully",
	data: {
		fileId,
		uploadUrl: `https://r2.example.com/${fileId}?X-Amz-Signature=abc`,
		contentType: "application/pdf",
		expiresAt: "2026-09-16T00:05:00.000Z",
		uploadExpiresAt: "2026-09-16T00:20:00.000Z",
	},
});

const confirmedFile = (
	fileId: string,
): ApiSuccessResponse<FileItemPayload> => ({
	success: true,
	message: "File uploaded successfully",
	data: {
		_id: fileId,
		name: "report.pdf",
		extension: ".pdf",
		contentType: "application/pdf",
		parentDirId: "dir-1",
		userId: "user-1",
		createdAt: "2026-09-16T00:00:00.000Z",
		updatedAt: "2026-09-16T00:00:00.000Z",
	},
});

const deferred = <T,>() => {
	let resolve!: (value: T) => void;
	let reject!: (reason?: unknown) => void;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
};

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(cancelUpload).mockResolvedValue({
		success: true,
		message: "Upload cancelled successfully",
		data: undefined,
	});
	vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
	vi.useRealTimers();
});

describe("useFileUpload", () => {
	it("walks a file through reserving, uploading, confirming and success", async () => {
		const mint = deferred<ApiSuccessResponse<UploadTicketPayload>>();
		const put = deferred<void>();
		const confirm = deferred<ApiSuccessResponse<FileItemPayload>>();

		vi.mocked(createUploadTicket).mockReturnValue(mint.promise);
		vi.mocked(uploadFileToR2).mockReturnValue(put.promise);
		vi.mocked(confirmUpload).mockReturnValue(confirm.promise);

		const { result } = renderUpload();

		act(() => result.current.upload(asFileList(makeFile("report.pdf"))));
		expect(result.current.uploads[0].status).toBe("reserving");

		await act(async () => {
			mint.resolve(ticketFor("file-1"));
		});
		expect(result.current.uploads[0].status).toBe("uploading");

		await act(async () => {
			put.resolve();
		});
		expect(result.current.uploads[0].status).toBe("confirming");

		await act(async () => {
			confirm.resolve(confirmedFile("file-1"));
		});
		await waitFor(() =>
			expect(result.current.uploads[0].status).toBe("success"),
		);
	});

	it("invalidates the directory listing only once the confirm resolves", async () => {
		const confirm = deferred<ApiSuccessResponse<FileItemPayload>>();

		vi.mocked(createUploadTicket).mockResolvedValue(ticketFor("file-1"));
		vi.mocked(uploadFileToR2).mockResolvedValue(undefined);
		vi.mocked(confirmUpload).mockReturnValue(confirm.promise);

		const client = new QueryClient();
		const invalidate = vi.spyOn(client, "invalidateQueries");
		const { result } = renderUpload(client);

		await act(async () => {
			result.current.upload(asFileList(makeFile("report.pdf")));
		});

		expect(result.current.uploads[0].status).toBe("confirming");
		expect(invalidate).not.toHaveBeenCalled();

		await act(async () => {
			confirm.resolve(confirmedFile("file-1"));
		});

		await waitFor(() =>
			expect(invalidate).toHaveBeenCalledWith({ queryKey: ["directory"] }),
		);
	});

	it("invalidates storageUsage as well as directory after a confirmed upload", async () => {
		const client = new QueryClient();
		const invalidate = vi.spyOn(client, "invalidateQueries");

		vi.mocked(createUploadTicket).mockResolvedValue(ticketFor("file-1"));
		vi.mocked(uploadFileToR2).mockResolvedValue(undefined);
		vi.mocked(confirmUpload).mockResolvedValue(confirmedFile("file-1"));

		const { result } = renderUpload(client);

		act(() => {
			result.current.upload(asFileList(makeFile("report.pdf")));
		});

		await waitFor(() => {
			expect(invalidate).toHaveBeenCalledWith({ queryKey: ["storageUsage"] });
		});
		expect(invalidate).toHaveBeenCalledWith({ queryKey: ["directory"] });
	});

	it("maps R2 transfer progress onto the row that is transferring", async () => {
		const notes = makeFile("notes.pdf");
		const slides = makeFile("slides.pdf");

		vi.mocked(createUploadTicket).mockImplementation(async (file) =>
			ticketFor(file.name),
		);
		vi.mocked(uploadFileToR2).mockReturnValue(deferred<void>().promise);

		const { result } = renderUpload();

		await act(async () => {
			result.current.upload(asFileList(notes, slides));
		});

		const slidesCall = vi
			.mocked(uploadFileToR2)
			.mock.calls.find(([, file]) => file === slides);

		act(() => slidesCall?.[2].onProgress?.(42));

		const byName = (name: string) =>
			result.current.uploads.find((item) => item.fileName === name);

		expect(byName("slides.pdf")?.progress).toBe(42);
		expect(byName("notes.pdf")?.progress).toBe(0);
	});

	it("hands the mint the destination directory but no abort signal", async () => {
		vi.mocked(createUploadTicket).mockReturnValue(
			deferred<ApiSuccessResponse<UploadTicketPayload>>().promise,
		);

		const { result } = renderUpload();

		act(() => result.current.upload(asFileList(makeFile("report.pdf"))));

		expect(createUploadTicket).toHaveBeenCalledWith(expect.any(File), "dir-1");
	});

	it("aborts the R2 request and drops the row when the user cancels", async () => {
		vi.mocked(createUploadTicket).mockResolvedValue(ticketFor("file-1"));
		vi.mocked(uploadFileToR2).mockReturnValue(deferred<void>().promise);

		const { result } = renderUpload();

		await act(async () => {
			result.current.upload(asFileList(makeFile("report.pdf")));
		});

		const [, , options] = vi.mocked(uploadFileToR2).mock.calls[0];
		const rowId = result.current.uploads[0].id;

		act(() => result.current.cancel(rowId));

		expect(options.signal?.aborted).toBe(true);
		expect(result.current.uploads).toHaveLength(0);
	});

	it("stops the machine when the abort lands between two steps", async () => {
		const mint = deferred<ApiSuccessResponse<UploadTicketPayload>>();

		vi.mocked(createUploadTicket).mockReturnValue(mint.promise);

		const { result } = renderUpload();

		act(() => result.current.upload(asFileList(makeFile("report.pdf"))));
		act(() => result.current.cancel(result.current.uploads[0].id));

		await act(async () => {
			mint.resolve(ticketFor("file-1"));
		});

		await waitFor(() => expect(cancelUpload).toHaveBeenCalledWith("file-1"));
		expect(uploadFileToR2).not.toHaveBeenCalled();
		expect(result.current.uploads).toHaveLength(0);
	});

	it("keeps a mapped mint failure inline and fires no toast", async () => {
		vi.mocked(createUploadTicket).mockRejectedValue({
			code: "STORAGE_LIMIT_EXCEEDED",
			message: "Storage limit exceeded",
		});

		const { result } = renderUpload();

		await act(async () => {
			result.current.upload(asFileList(makeFile("report.pdf")));
		});

		expect(result.current.uploads[0]).toMatchObject({
			status: "error",
			errorMessage:
				"You don't have enough storage left for this file. Free up some space and try again.",
		});
		expect(toast.error).not.toHaveBeenCalled();
	});

	it("falls back to the mint copy and toasts when the mint code is unmapped", async () => {
		vi.mocked(createUploadTicket).mockRejectedValue({
			code: "INTERNAL_SERVER_ERROR",
			message: "Something went wrong",
		});

		const { result } = renderUpload();

		await act(async () => {
			result.current.upload(asFileList(makeFile("report.pdf")));
		});

		expect(result.current.uploads[0]).toMatchObject({
			status: "error",
			errorMessage: "We couldn't start your upload. Please try again.",
		});
		expect(toast.error).toHaveBeenCalledWith(
			"We couldn't start your upload. Please try again.",
		);
	});

	it("blames an expired link when R2 rejects the transfer with 403", async () => {
		vi.mocked(createUploadTicket).mockResolvedValue(ticketFor("file-1"));
		vi.mocked(uploadFileToR2).mockRejectedValue(
			Object.assign(new Error("Request failed with status code 403"), {
				response: { status: 403 },
			}),
		);

		const { result } = renderUpload();

		await act(async () => {
			result.current.upload(asFileList(makeFile("report.pdf")));
		});

		expect(result.current.uploads[0]).toMatchObject({
			status: "error",
			errorMessage:
				"This upload link expired before the file finished. Please upload it again.",
		});
	});

	it("toasts a transfer failure R2 did not answer with 403", async () => {
		vi.mocked(createUploadTicket).mockResolvedValue(ticketFor("file-1"));
		vi.mocked(uploadFileToR2).mockRejectedValue(new Error("Network Error"));

		const { result } = renderUpload();

		await act(async () => {
			result.current.upload(asFileList(makeFile("report.pdf")));
		});

		expect(result.current.uploads[0]).toMatchObject({
			status: "error",
			errorMessage:
				"The file couldn't be transferred. Please check your connection and try again.",
		});
		expect(toast.error).toHaveBeenCalledWith(
			"The file couldn't be transferred. Please check your connection and try again.",
		);
	});

	it("confirms one upload at a time so the rate limit holds", async () => {
		const first = deferred<ApiSuccessResponse<FileItemPayload>>();
		const second = deferred<ApiSuccessResponse<FileItemPayload>>();

		vi.mocked(createUploadTicket).mockImplementation(async (file) =>
			ticketFor(file.name),
		);
		vi.mocked(uploadFileToR2).mockResolvedValue(undefined);
		vi.mocked(confirmUpload)
			.mockReturnValueOnce(first.promise)
			.mockReturnValueOnce(second.promise);

		const { result } = renderUpload();

		await act(async () => {
			result.current.upload(
				asFileList(makeFile("notes.pdf"), makeFile("slides.pdf")),
			);
		});

		expect(confirmUpload).toHaveBeenCalledTimes(1);
		expect(confirmUpload).toHaveBeenCalledWith(
			"notes.pdf",
			expect.any(AbortSignal),
		);

		await act(async () => {
			first.resolve(confirmedFile("notes.pdf"));
		});

		expect(confirmUpload).toHaveBeenCalledTimes(2);
		expect(confirmUpload).toHaveBeenLastCalledWith(
			"slides.pdf",
			expect.any(AbortSignal),
		);

		await act(async () => {
			second.resolve(confirmedFile("slides.pdf"));
		});
	});

	it("skips the confirm for a queued row the user cancels", async () => {
		const first = deferred<ApiSuccessResponse<FileItemPayload>>();

		vi.mocked(createUploadTicket).mockImplementation(async (file) =>
			ticketFor(file.name),
		);
		vi.mocked(uploadFileToR2).mockResolvedValue(undefined);
		vi.mocked(confirmUpload).mockReturnValue(first.promise);

		const { result } = renderUpload();

		await act(async () => {
			result.current.upload(
				asFileList(makeFile("notes.pdf"), makeFile("slides.pdf")),
			);
		});

		const byName = (name: string) =>
			result.current.uploads.find((item) => item.fileName === name);

		expect(confirmUpload).toHaveBeenCalledTimes(1);
		expect(confirmUpload).toHaveBeenCalledWith(
			"notes.pdf",
			expect.any(AbortSignal),
		);

		act(() => result.current.cancel(byName("slides.pdf")?.id ?? ""));

		await act(async () => {
			first.resolve(confirmedFile("notes.pdf"));
		});

		expect(confirmUpload).toHaveBeenCalledTimes(1);
		expect(byName("slides.pdf")).toBeUndefined();
	});

	it("invalidates the directory when a cancel lands during the confirm", async () => {
		const confirm = deferred<ApiSuccessResponse<FileItemPayload>>();

		vi.mocked(createUploadTicket).mockResolvedValue(ticketFor("file-1"));
		vi.mocked(uploadFileToR2).mockResolvedValue(undefined);
		vi.mocked(confirmUpload).mockReturnValue(confirm.promise);

		const client = new QueryClient();
		const invalidate = vi.spyOn(client, "invalidateQueries");
		const { result } = renderUpload(client);

		await act(async () => {
			result.current.upload(asFileList(makeFile("report.pdf")));
		});

		expect(result.current.uploads[0].status).toBe("confirming");

		act(() => result.current.cancel(result.current.uploads[0].id));

		// The server committed before the abort landed, so the listing is stale.
		await act(async () => {
			confirm.resolve(confirmedFile("file-1"));
		});

		await waitFor(() =>
			expect(invalidate).toHaveBeenCalledWith({ queryKey: ["directory"] }),
		);
		expect(result.current.uploads).toHaveLength(0);
	});

	it("retries a rate-limited confirm after a backoff and then succeeds", async () => {
		vi.mocked(createUploadTicket).mockResolvedValue(ticketFor("file-1"));
		vi.mocked(uploadFileToR2).mockResolvedValue(undefined);
		vi.mocked(confirmUpload)
			.mockRejectedValueOnce({
				code: "RATE_LIMITED",
				message: "Too many requests",
			})
			.mockResolvedValueOnce(confirmedFile("file-1"));

		const { result } = renderUpload();

		await act(async () => {
			result.current.upload(asFileList(makeFile("report.pdf")));
		});

		expect(confirmUpload).toHaveBeenCalledTimes(1);
		expect(result.current.uploads[0].status).toBe("confirming");

		await act(async () => {
			await vi.advanceTimersByTimeAsync(1000);
		});

		expect(confirmUpload).toHaveBeenCalledTimes(2);
		await waitFor(() =>
			expect(result.current.uploads[0].status).toBe("success"),
		);
	});

	it("retries a confirm lost to a network error and then succeeds", async () => {
		vi.mocked(createUploadTicket).mockResolvedValue(ticketFor("file-1"));
		vi.mocked(uploadFileToR2).mockResolvedValue(undefined);
		vi.mocked(confirmUpload)
			.mockRejectedValueOnce({
				code: "NETWORK_ERROR",
				message: "Something went wrong. Please try again.",
			})
			.mockResolvedValueOnce(confirmedFile("file-1"));

		const client = new QueryClient();
		const invalidate = vi.spyOn(client, "invalidateQueries");
		const { result } = renderUpload(client);

		await act(async () => {
			result.current.upload(asFileList(makeFile("report.pdf")));
		});

		expect(confirmUpload).toHaveBeenCalledTimes(1);
		expect(result.current.uploads[0].status).toBe("confirming");

		await act(async () => {
			await vi.advanceTimersByTimeAsync(1000);
		});

		expect(confirmUpload).toHaveBeenCalledTimes(2);
		await waitFor(() =>
			expect(result.current.uploads[0].status).toBe("success"),
		);
		expect(invalidate).toHaveBeenCalledWith({ queryKey: ["directory"] });
	});

	it("gives up after three rate-limited confirm attempts and shows the mapped copy", async () => {
		vi.mocked(createUploadTicket).mockResolvedValue(ticketFor("file-1"));
		vi.mocked(uploadFileToR2).mockResolvedValue(undefined);
		vi.mocked(confirmUpload).mockRejectedValue({
			code: "RATE_LIMITED",
			message: "Too many requests",
		});

		const { result } = renderUpload();

		await act(async () => {
			result.current.upload(asFileList(makeFile("report.pdf")));
		});

		await act(async () => {
			await vi.advanceTimersByTimeAsync(1000);
		});
		await act(async () => {
			await vi.advanceTimersByTimeAsync(2000);
		});

		expect(confirmUpload).toHaveBeenCalledTimes(3);
		expect(result.current.uploads[0]).toMatchObject({
			status: "error",
			errorMessage:
				"You've started too many uploads at once. Please wait a moment and try again.",
		});
	});

	it("fails an incomplete upload on the first confirm without retrying", async () => {
		vi.mocked(createUploadTicket).mockResolvedValue(ticketFor("file-1"));
		vi.mocked(uploadFileToR2).mockResolvedValue(undefined);
		vi.mocked(confirmUpload).mockRejectedValue({
			code: "UPLOAD_INCOMPLETE",
			message: "Upload incomplete",
		});

		const { result } = renderUpload();

		await act(async () => {
			result.current.upload(asFileList(makeFile("report.pdf")));
		});

		expect(confirmUpload).toHaveBeenCalledTimes(1);
		expect(result.current.uploads[0]).toMatchObject({
			status: "error",
			errorMessage:
				"Your file didn't finish uploading. Please upload it again.",
		});
	});

	it("surfaces UPLOAD_ALREADY_CONFIRMED as a failure, not a success", async () => {
		vi.mocked(createUploadTicket).mockResolvedValue(ticketFor("file-1"));
		vi.mocked(uploadFileToR2).mockResolvedValue(undefined);
		vi.mocked(confirmUpload).mockRejectedValue({
			code: "UPLOAD_ALREADY_CONFIRMED",
			message: "Upload already confirmed",
		});

		const client = new QueryClient();
		const invalidate = vi.spyOn(client, "invalidateQueries");
		const { result } = renderUpload(client);

		await act(async () => {
			result.current.upload(asFileList(makeFile("report.pdf")));
		});

		expect(confirmUpload).toHaveBeenCalledTimes(1);
		expect(result.current.uploads[0]).toMatchObject({
			status: "error",
			errorMessage:
				"This upload was already finished and the stored file no longer matches. Please upload it again.",
		});
		expect(invalidate).not.toHaveBeenCalledWith({ queryKey: ["directory"] });
		expect(invalidate).toHaveBeenCalledWith({ queryKey: ["storageUsage"] });
	});

	it("keeps a confirm refused because a cancel landed first inline", async () => {
		vi.mocked(createUploadTicket).mockResolvedValue(ticketFor("file-1"));
		vi.mocked(uploadFileToR2).mockResolvedValue(undefined);
		vi.mocked(confirmUpload).mockRejectedValue({
			code: "UPLOAD_CANCELLED",
			message: "This upload was cancelled. Please start a new upload.",
		});

		const { result } = renderUpload();

		await act(async () => {
			result.current.upload(asFileList(makeFile("report.pdf")));
		});

		expect(confirmUpload).toHaveBeenCalledTimes(1);
		expect(result.current.uploads[0]).toMatchObject({
			status: "error",
			errorMessage: "This upload was cancelled. Please start a new upload.",
		});
		expect(toast.error).not.toHaveBeenCalled();
	});

	it("toasts as well as filling the row when the failure is unmapped", async () => {
		vi.mocked(createUploadTicket).mockResolvedValue(ticketFor("file-1"));
		vi.mocked(uploadFileToR2).mockResolvedValue(undefined);
		vi.mocked(confirmUpload).mockRejectedValue({
			code: "INTERNAL_SERVER_ERROR",
			message: "Something went wrong",
		});

		const { result } = renderUpload();

		await act(async () => {
			result.current.upload(asFileList(makeFile("report.pdf")));
		});

		expect(result.current.uploads[0]).toMatchObject({
			status: "error",
			errorMessage: "We couldn't finish your upload. Please try again.",
		});
		expect(toast.error).toHaveBeenCalledWith(
			"We couldn't finish your upload. Please try again.",
		);
	});

	it("clears a finished row from the panel two seconds after success", async () => {
		vi.mocked(createUploadTicket).mockResolvedValue(ticketFor("file-1"));
		vi.mocked(uploadFileToR2).mockResolvedValue(undefined);
		vi.mocked(confirmUpload).mockResolvedValue(confirmedFile("file-1"));

		const { result } = renderUpload();

		await act(async () => {
			result.current.upload(asFileList(makeFile("report.pdf")));
		});

		expect(result.current.uploads[0].status).toBe("success");

		await act(async () => {
			await vi.advanceTimersByTimeAsync(2000);
		});

		expect(result.current.uploads).toHaveLength(0);
	});

	it("drops the pending auto-dismiss when the user dismisses the row first", async () => {
		vi.mocked(createUploadTicket).mockResolvedValue(ticketFor("file-1"));
		vi.mocked(uploadFileToR2).mockResolvedValue(undefined);
		vi.mocked(confirmUpload).mockResolvedValue(confirmedFile("file-1"));

		const { result } = renderUpload();

		await act(async () => {
			result.current.upload(asFileList(makeFile("report.pdf")));
		});

		expect(result.current.uploads[0].status).toBe("success");
		expect(vi.getTimerCount()).toBe(1);

		act(() => result.current.dismiss(result.current.uploads[0].id));

		expect(vi.getTimerCount()).toBe(0);
		expect(result.current.uploads).toHaveLength(0);

		// A surviving timer would fire dismiss again and re-render with a fresh array.
		const settled = result.current.uploads;

		await act(async () => {
			await vi.advanceTimersByTimeAsync(3000);
		});

		expect(result.current.uploads).toBe(settled);
	});

	it("aborts in-flight transfers on unmount", async () => {
		vi.mocked(createUploadTicket).mockResolvedValue(ticketFor("file-1"));
		vi.mocked(uploadFileToR2).mockReturnValue(deferred<void>().promise);

		const { result, unmount } = renderUpload();

		await act(async () => {
			result.current.upload(asFileList(makeFile("report.pdf")));
		});

		const [, , options] = vi.mocked(uploadFileToR2).mock.calls[0];

		unmount();

		expect(options.signal?.aborted).toBe(true);
	});

	it("drops a pending auto-dismiss on unmount", async () => {
		vi.mocked(createUploadTicket).mockResolvedValue(ticketFor("file-1"));
		vi.mocked(uploadFileToR2).mockResolvedValue(undefined);
		vi.mocked(confirmUpload).mockResolvedValue(confirmedFile("file-1"));

		const { result, unmount } = renderUpload();

		await act(async () => {
			result.current.upload(asFileList(makeFile("report.pdf")));
		});

		expect(result.current.uploads[0].status).toBe("success");
		expect(vi.getTimerCount()).toBe(1);

		unmount();

		expect(vi.getTimerCount()).toBe(0);
	});

	it("cuts a pending confirm backoff short when the upload is cancelled", async () => {
		vi.mocked(createUploadTicket).mockResolvedValue(ticketFor("file-1"));
		vi.mocked(uploadFileToR2).mockResolvedValue(undefined);
		vi.mocked(confirmUpload).mockRejectedValue({
			code: "RATE_LIMITED",
			message: "Too many requests",
		});

		const { result } = renderUpload();

		await act(async () => {
			result.current.upload(asFileList(makeFile("report.pdf")));
		});

		expect(confirmUpload).toHaveBeenCalledTimes(1);

		await act(async () => {
			result.current.cancel(result.current.uploads[0].id);
			await Promise.resolve();
		});

		expect(vi.getTimerCount()).toBe(0);
		expect(confirmUpload).toHaveBeenCalledTimes(1);
		expect(result.current.uploads).toHaveLength(0);
	});
});

describe("useFileUpload — storage usage after a reservation", () => {

	it("refreshes storage usage when the transfer fails after the mint", async () => {
		const client = new QueryClient();
		const invalidate = vi.spyOn(client, "invalidateQueries");

		vi.mocked(createUploadTicket).mockResolvedValue(ticketFor("file-1"));
		vi.mocked(uploadFileToR2).mockRejectedValue(new Error("Network Error"));

		const { result } = renderUpload(client);

		await act(async () => {
			result.current.upload(asFileList(makeFile("report.pdf")));
		});

		await waitFor(() =>
			expect(invalidate).toHaveBeenCalledWith({ queryKey: ["storageUsage"] }),
		);
	});

	it("refreshes storage usage when the user cancels mid-transfer", async () => {
		const client = new QueryClient();
		const invalidate = vi.spyOn(client, "invalidateQueries");

		const put = deferred<void>();
		vi.mocked(createUploadTicket).mockResolvedValue(ticketFor("file-1"));
		vi.mocked(uploadFileToR2).mockReturnValue(put.promise);

		const { result } = renderUpload(client);

		await act(async () => {
			result.current.upload(asFileList(makeFile("report.pdf")));
		});

		await act(async () => {
			result.current.cancel(result.current.uploads[0].id);
			put.reject(Object.assign(new Error("canceled"), { code: "ERR_CANCELED" }));
			await Promise.resolve();
		});

		await waitFor(() =>
			expect(invalidate).toHaveBeenCalledWith({ queryKey: ["storageUsage"] }),
		);
	});

	it("leaves storage usage alone when the mint itself fails", async () => {
		const client = new QueryClient();
		const invalidate = vi.spyOn(client, "invalidateQueries");

		vi.mocked(createUploadTicket).mockRejectedValue({
			code: "STORAGE_LIMIT_EXCEEDED",
			message: "Storage limit exceeded",
		});

		const { result } = renderUpload(client);

		await act(async () => {
			result.current.upload(asFileList(makeFile("report.pdf")));
		});

		await waitFor(() =>
			expect(result.current.uploads[0].status).toBe("error"),
		);
		expect(invalidate).not.toHaveBeenCalledWith({ queryKey: ["storageUsage"] });
	});
});

describe("useFileUpload — releasing an aborted reservation", () => {
	it("cancels the reservation when the user aborts mid-transfer", async () => {
		const put = deferred<void>();
		vi.mocked(createUploadTicket).mockResolvedValue(ticketFor("file-1"));
		vi.mocked(uploadFileToR2).mockReturnValue(put.promise);

		const { result } = renderUpload();

		await act(async () => {
			result.current.upload(asFileList(makeFile("report.pdf")));
		});

		await act(async () => {
			result.current.cancel(result.current.uploads[0].id);
			put.reject(Object.assign(new Error("canceled"), { code: "ERR_CANCELED" }));
			await Promise.resolve();
		});

		await waitFor(() => expect(cancelUpload).toHaveBeenCalledWith("file-1"));
	});

	it("cancels the reservation when the hook unmounts mid-transfer", async () => {
		const put = deferred<void>();
		vi.mocked(createUploadTicket).mockResolvedValue(ticketFor("file-1"));
		vi.mocked(uploadFileToR2).mockReturnValue(put.promise);

		const { result, unmount } = renderUpload();

		await act(async () => {
			result.current.upload(asFileList(makeFile("report.pdf")));
		});

		unmount();
		put.reject(Object.assign(new Error("canceled"), { code: "ERR_CANCELED" }));

		await waitFor(() => expect(cancelUpload).toHaveBeenCalledWith("file-1"));
	});

	it.each([
		[
			"a mapped code",
			{ code: "STORAGE_LIMIT_EXCEEDED", message: "Storage limit exceeded" },
		],
		[
			"an unmapped code",
			{ code: "INTERNAL_SERVER_ERROR", message: "Something went wrong" },
		],
	])(
		"stays silent when a mint the user cancelled fails with %s",
		async (_label, failure) => {
			const mint = deferred<ApiSuccessResponse<UploadTicketPayload>>();
			vi.mocked(createUploadTicket).mockReturnValue(mint.promise);

			const { result } = renderUpload();

			act(() => result.current.upload(asFileList(makeFile("report.pdf"))));
			act(() => result.current.cancel(result.current.uploads[0].id));

			await act(async () => {
				mint.reject(failure);
			});

			expect(cancelUpload).not.toHaveBeenCalled();
			expect(toast.error).not.toHaveBeenCalled();
			expect(result.current.uploads).toHaveLength(0);
		},
	);

	it("cancels the reservation when the abort lands after the confirm was issued", async () => {
		const confirm = deferred<ApiSuccessResponse<FileItemPayload>>();
		vi.mocked(createUploadTicket).mockResolvedValue(ticketFor("file-1"));
		vi.mocked(uploadFileToR2).mockResolvedValue(undefined);
		vi.mocked(confirmUpload).mockReturnValue(confirm.promise);

		const { result } = renderUpload();

		await act(async () => {
			result.current.upload(asFileList(makeFile("report.pdf")));
		});

		expect(result.current.uploads[0].status).toBe("confirming");

		act(() => result.current.cancel(result.current.uploads[0].id));

		await act(async () => {
			confirm.resolve(confirmedFile("file-1"));
		});

		await waitFor(() => expect(cancelUpload).toHaveBeenCalledWith("file-1"));
	});

	it("cancels the reservation when the transfer finishes after the abort", async () => {
		const put = deferred<void>();
		vi.mocked(createUploadTicket).mockResolvedValue(ticketFor("file-1"));
		vi.mocked(uploadFileToR2).mockReturnValue(put.promise);

		const { result } = renderUpload();

		await act(async () => {
			result.current.upload(asFileList(makeFile("report.pdf")));
		});

		act(() => result.current.cancel(result.current.uploads[0].id));

		await act(async () => {
			put.resolve();
		});

		await waitFor(() => expect(cancelUpload).toHaveBeenCalledWith("file-1"));
		expect(confirmUpload).not.toHaveBeenCalled();
	});

	it.each([
		["a server error", { code: "INTERNAL_SERVER_ERROR", message: "Boom" }],
		["a network error", { code: "NETWORK_ERROR", message: "Offline" }],
	])(
		"stays silent when the cancel fails with %s",
		async (_label, failure) => {
			const put = deferred<void>();
			vi.mocked(createUploadTicket).mockResolvedValue(ticketFor("file-1"));
			vi.mocked(uploadFileToR2).mockReturnValue(put.promise);
			vi.mocked(cancelUpload).mockRejectedValue(failure);

			const { result } = renderUpload();

			await act(async () => {
				result.current.upload(asFileList(makeFile("report.pdf")));
			});

			await act(async () => {
				result.current.cancel(result.current.uploads[0].id);
				put.reject(
					Object.assign(new Error("canceled"), { code: "ERR_CANCELED" }),
				);
				await Promise.resolve();
			});

			await waitFor(() => expect(cancelUpload).toHaveBeenCalledWith("file-1"));
			expect(toast.error).not.toHaveBeenCalled();
			expect(result.current.uploads).toHaveLength(0);
		},
	);

	it("leaves the reservation alone for an upload that succeeds", async () => {
		vi.mocked(createUploadTicket).mockResolvedValue(ticketFor("file-1"));
		vi.mocked(uploadFileToR2).mockResolvedValue(undefined);
		vi.mocked(confirmUpload).mockResolvedValue(confirmedFile("file-1"));

		const { result } = renderUpload();

		await act(async () => {
			result.current.upload(asFileList(makeFile("report.pdf")));
		});

		expect(result.current.uploads[0].status).toBe("success");
		expect(cancelUpload).not.toHaveBeenCalled();
	});

	it("leaves the reservation alone when the transfer fails without an abort", async () => {
		vi.mocked(createUploadTicket).mockResolvedValue(ticketFor("file-1"));
		vi.mocked(uploadFileToR2).mockRejectedValue(new Error("Network Error"));

		const { result } = renderUpload();

		await act(async () => {
			result.current.upload(asFileList(makeFile("report.pdf")));
		});

		expect(result.current.uploads[0].status).toBe("error");
		expect(cancelUpload).not.toHaveBeenCalled();
	});
});
