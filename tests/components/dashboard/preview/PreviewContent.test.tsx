//* tests/components/dashboard/preview/PreviewContent.test.tsx

import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";

import { renderWithProviders } from "../../../lib/render";
import server from "../../../server";
import { API_BASE_URL } from "@/lib/constants";
import PreviewContent from "@/components/dashboard/preview/PreviewContent";
import type { FileItemPayload } from "@/types/directory.types";

const signedUrl = "https://r2.example.com/shot.png?X-Amz-Signature=abc";

const imageFile: FileItemPayload = {
	_id: "file1",
	name: "shot.png",
	extension: ".png",
	contentType: "image/png",
	size: 2048,
	parentDirId: "root",
	userId: "u1",
	createdAt: "2026-04-01T10:00:00Z",
	updatedAt: "2026-04-15T12:00:00Z",
};

const mintOk = () =>
	server.use(
		http.get(`${API_BASE_URL}/files/file1/download-url`, () =>
			HttpResponse.json({
				success: true,
				message: "Download URL created successfully",
				data: { url: signedUrl, expiresAt: "2026-09-13T13:00:00.000Z" },
			}),
		),
	);

describe("PreviewContent", () => {
	it("renders an image from the freshly minted signed URL", async () => {
		mintOk();

		renderWithProviders(<PreviewContent file={imageFile} />);

		const img = await screen.findByAltText("shot.png");
		expect(img).toHaveAttribute("src", signedUrl);
	});

	it("does not point at the metadata endpoint, which no longer serves bytes", async () => {
		mintOk();

		renderWithProviders(<PreviewContent file={imageFile} />);

		const img = await screen.findByAltText("shot.png");
		expect(img.getAttribute("src")).not.toContain("/api/files/file1");
	});

	it("surfaces a failed mint instead of rendering a broken image", async () => {
		server.use(
			http.get(`${API_BASE_URL}/files/file1/download-url`, () =>
				HttpResponse.json(
					{
						status: "fail",
						error: { code: "FILE_NOT_FOUND", message: "gone" },
					},
					{ status: 404 },
				),
			),
		);

		renderWithProviders(<PreviewContent file={imageFile} />);

		expect(await screen.findByText(/couldn't load this preview/i)).toBeInTheDocument();
		expect(screen.queryByAltText("shot.png")).toBeNull();
	});
});
