//* tests/api/uploadFileToR2.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";
import axios, { type AxiosProgressEvent } from "axios";

import { uploadFileToR2 } from "@/api/file.api";

// axiosClient.ts runs axios.create(...).interceptors.response.use(...) on import.
vi.mock("axios", () => ({
	default: {
		put: vi.fn(),
		create: () => ({ interceptors: { response: { use: vi.fn() } } }),
	},
}));

const uploadUrl = "https://r2.example.com/upload?X-Amz-Signature=abc";

const pdf = new File(["a".repeat(2048)], "report.pdf", {
	type: "application/pdf",
});

const progressEvent = (loaded: number, total?: number): AxiosProgressEvent => ({
	loaded,
	total,
	bytes: loaded,
	lengthComputable: total !== undefined,
});

describe("uploadFileToR2", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("puts the file unmodified to the presigned URL", async () => {
		await uploadFileToR2(uploadUrl, pdf, { contentType: "application/pdf" });

		const [url, body] = vi.mocked(axios.put).mock.calls[0];

		expect(url).toBe(uploadUrl);
		expect(body).toBe(pdf);
	});

	it("signs with the minted content type and no other header", async () => {
		await uploadFileToR2(uploadUrl, pdf, { contentType: "image/png" });

		const [, , config] = vi.mocked(axios.put).mock.calls[0];

		expect(config?.headers).toEqual({ "Content-Type": "image/png" });
	});

	it("threads the abort signal through so the transfer stays cancellable", async () => {
		const controller = new AbortController();

		await uploadFileToR2(uploadUrl, pdf, {
			contentType: "application/pdf",
			signal: controller.signal,
		});

		const [, , config] = vi.mocked(axios.put).mock.calls[0];

		expect(config?.signal).toBe(controller.signal);
	});

	it("reports transferred bytes as a rounded percentage", async () => {
		const onProgress = vi.fn();

		await uploadFileToR2(uploadUrl, pdf, {
			contentType: "application/pdf",
			onProgress,
		});

		const [, , config] = vi.mocked(axios.put).mock.calls[0];
		config?.onUploadProgress?.(progressEvent(1, 3));

		expect(onProgress).toHaveBeenCalledWith(33);
	});

	it("stays quiet when the total size is unknown", async () => {
		const onProgress = vi.fn();

		await uploadFileToR2(uploadUrl, pdf, {
			contentType: "application/pdf",
			onProgress,
		});

		const [, , config] = vi.mocked(axios.put).mock.calls[0];

		expect(() => config?.onUploadProgress?.(progressEvent(1024))).not.toThrow();
		expect(onProgress).not.toHaveBeenCalled();
	});
});
