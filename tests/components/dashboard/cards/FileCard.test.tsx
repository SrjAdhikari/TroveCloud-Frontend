//* tests/components/dashboard/cards/FileCard.test.tsx

import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import { renderWithProviders } from "../../../lib/render";
import server from "../../../server";
import { API_BASE_URL } from "@/lib/constants";
import { formatBytes, formatDateTime } from "@/lib/formatters";
import FileCard from "@/components/dashboard/cards/FileCard";
import type { FileItemPayload } from "@/types/directory.types";

const file: FileItemPayload = {
	_id: "file1",
	name: "report.pdf",
	extension: ".pdf",
	contentType: "application/pdf",
	size: 2048,
	parentDirId: "root",
	userId: "u1",
	createdAt: "2026-04-01T10:00:00Z",
	updatedAt: "2026-04-15T12:00:00Z",
};

describe("FileCard — download", () => {
	it("sends the browser to the minted signed URL rather than a blob", async () => {
		const user = userEvent.setup();
		const signedUrl = "https://r2.example.com/report.pdf?X-Amz-Signature=abc";
		server.use(
			http.get(`${API_BASE_URL}/files/file1/download-url`, () =>
				HttpResponse.json({
					success: true,
					message: "Download URL created successfully",
					data: { url: signedUrl, expiresAt: "2026-09-13T13:00:00.000Z" },
				}),
			),
		);

		const navigatedTo: string[] = [];
		const clickSpy = vi
			.spyOn(HTMLAnchorElement.prototype, "click")
			.mockImplementation(function (this: HTMLAnchorElement) {
				navigatedTo.push(this.href);
			});

		renderWithProviders(
			<FileCard file={file} view="list" currentPath="/My Files" />,
		);

		await user.click(screen.getByRole("button", { name: /more actions/i }));
		await user.click(await screen.findByRole("menuitem", { name: /download/i }));

		await waitFor(() => expect(navigatedTo).toContain(signedUrl));

		clickSpy.mockRestore();
	});
});

describe("FileCard — list view", () => {
	it("renders the row as a button (no link) — file rows open an in-app preview, not a route", () => {
		renderWithProviders(<FileCard file={file} view="list" currentPath="/My Files" />);

		expect(screen.queryByRole("link", { name: /report\.pdf/i })).toBeNull();
		expect(
			screen.getByRole("button", { name: /report\.pdf/i }),
		).toBeInTheDocument();
	});

	it("clicking the row opens the preview dialog", async () => {
		const user = userEvent.setup();
		renderWithProviders(<FileCard file={file} view="list" currentPath="/My Files" />);

		expect(screen.queryByRole("dialog")).toBeNull();

		await user.click(screen.getByRole("button", { name: /report\.pdf/i }));

		expect(await screen.findByRole("dialog")).toBeInTheDocument();
	});

	it("clicking the More actions trigger does not open the preview dialog", async () => {
		const user = userEvent.setup();
		renderWithProviders(<FileCard file={file} view="list" currentPath="/My Files" />);

		await user.click(screen.getByRole("button", { name: /more actions/i }));

		// The menu opened ...
		expect(await screen.findByRole("menu")).toBeInTheDocument();
		// ... and the preview dialog did NOT.
		expect(screen.queryByRole("dialog")).toBeNull();
	});

	it("opening Details shows the file's full path", async () => {
		const user = userEvent.setup();
		renderWithProviders(
			<FileCard file={file} view="list" currentPath="/My Files" />,
		);

		await user.click(screen.getByRole("button", { name: /more actions/i }));
		await user.click(
			await screen.findByRole("menuitem", { name: /details/i }),
		);

		expect(
			await screen.findByText("/My Files/report.pdf"),
		).toBeInTheDocument();
	});
});

describe("FileCard — grid view", () => {
	it("shows the name with the extension kept visible, and no size/date metadata", () => {
		renderWithProviders(<FileCard file={file} view="grid" currentPath="/My Files" />);

		// Name is split so the extension survives end-truncation of long names.
		expect(screen.getByText("report")).toBeInTheDocument();
		expect(screen.getByText(".pdf")).toBeInTheDocument();
		expect(screen.queryByText(formatBytes(file.size!))).toBeNull();
		expect(screen.queryByText(formatDateTime(file.updatedAt))).toBeNull();
	});
});
