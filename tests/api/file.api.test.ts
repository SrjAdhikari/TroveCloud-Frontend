//* tests/api/file.api.test.ts

import { describe, it, expect, vi, afterEach } from "vitest";
import { http, HttpResponse } from "msw";

import server from "../server";
import axiosClient from "@/config/axiosClient";
import { API_BASE_URL } from "@/lib/constants";
import {
	confirmUpload,
	createUploadTicket,
	getFileDownloadUrl,
} from "@/api/file.api";

const signed = {
	url: "https://r2.example.com/report.pdf?X-Amz-Signature=abc",
	expiresAt: "2026-09-13T13:00:00.000Z",
};

const ticket = {
	fileId: "file1",
	uploadUrl: "https://r2.example.com/upload?X-Amz-Signature=abc",
	contentType: "application/pdf",
	expiresAt: "2026-09-13T13:00:00.000Z",
	uploadExpiresAt: "2026-09-13T13:15:00.000Z",
};

const pdf = new File(["a".repeat(2048)], "report.pdf", {
	type: "application/pdf",
});

describe("createUploadTicket", () => {
	it("declares the file name and size to the parent directory endpoint", async () => {
		let body: unknown = null;
		server.use(
			http.post(`${API_BASE_URL}/files/dir1`, async ({ request }) => {
				body = await request.json();
				return HttpResponse.json(
					{
						success: true,
						message: "Upload initiated successfully",
						data: ticket,
					},
					{ status: 201 },
				);
			}),
		);

		const response = await createUploadTicket(pdf, "dir1");

		expect(body).toEqual({ name: "report.pdf", size: 2048 });
		expect(response.data.uploadUrl).toBe(ticket.uploadUrl);
	});

	it("mints against the root endpoint when no parent directory is given", async () => {
		let requestUrl = "";
		server.use(
			http.post(`${API_BASE_URL}/files`, ({ request }) => {
				requestUrl = request.url;
				return HttpResponse.json(
					{
						success: true,
						message: "Upload initiated successfully",
						data: ticket,
					},
					{ status: 201 },
				);
			}),
		);

		const response = await createUploadTicket(pdf);

		expect(requestUrl).toBe(`${API_BASE_URL}/files`);
		expect(response.data.fileId).toBe(ticket.fileId);
	});
});

describe("confirmUpload", () => {
	// vitest.config.ts sets no restoreMocks, so the axiosClient spy below would
	// otherwise stay installed for the MSW-backed tests that follow.
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("promotes the pending file and returns the finished document", async () => {
		let body = "unset";
		server.use(
			http.post(`${API_BASE_URL}/files/file1/confirm`, async ({ request }) => {
				body = await request.text();
				return HttpResponse.json({
					success: true,
					message: "File uploaded successfully",
					data: { _id: "file1", name: "report.pdf", size: 2048 },
				});
			}),
		);

		const response = await confirmUpload("file1");

		expect(body).toBe("");
		expect(response.data.name).toBe("report.pdf");
	});

	it("bounds the request with a timeout and threads the abort signal", async () => {
		server.use(
			http.post(`${API_BASE_URL}/files/file1/confirm`, () =>
				HttpResponse.json({
					success: true,
					message: "File uploaded successfully",
					data: { _id: "file1", name: "report.pdf", size: 2048 },
				}),
			),
		);

		const controller = new AbortController();
		const post = vi.spyOn(axiosClient, "post");

		await confirmUpload("file1", controller.signal);

		const [, , config] = post.mock.calls[0];

		expect(config?.timeout).toBe(30000);
		expect(config?.signal).toBe(controller.signal);
	});
});

describe("getFileDownloadUrl", () => {
	it("mints a signed URL and forces attachment when downloading", async () => {
		let action: string | null = null;
		server.use(
			http.get(`${API_BASE_URL}/files/file1/download-url`, ({ request }) => {
				action = new URL(request.url).searchParams.get("action");
				return HttpResponse.json({
					success: true,
					message: "Download URL created successfully",
					data: signed,
				});
			}),
		);

		const response = await getFileDownloadUrl("file1", "download");

		expect(response.data.url).toBe(signed.url);
		expect(action).toBe("download");
	});

	it("omits the action so the browser can preview inline", async () => {
		let action: string | null = "unset";
		server.use(
			http.get(`${API_BASE_URL}/files/file1/download-url`, ({ request }) => {
				action = new URL(request.url).searchParams.get("action");
				return HttpResponse.json({
					success: true,
					message: "Download URL created successfully",
					data: signed,
				});
			}),
		);

		const response = await getFileDownloadUrl("file1");

		expect(response.data.url).toBe(signed.url);
		expect(action).toBeNull();
	});
});
