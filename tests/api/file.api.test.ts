//* tests/api/file.api.test.ts

import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";

import server from "../server";
import { API_BASE_URL } from "@/lib/constants";
import { getFileDownloadUrl } from "@/api/file.api";

const signed = {
	url: "https://r2.example.com/report.pdf?X-Amz-Signature=abc",
	expiresAt: "2026-09-13T13:00:00.000Z",
};

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
