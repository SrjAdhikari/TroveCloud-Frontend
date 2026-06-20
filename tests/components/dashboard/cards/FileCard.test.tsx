//* tests/components/dashboard/cards/FileCard.test.tsx

import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "../../../lib/render";
import FileCard from "@/components/dashboard/cards/FileCard";
import type { FileItemPayload } from "@/types/directory.types";

const file: FileItemPayload = {
	_id: "file1",
	name: "report.pdf",
	extension: ".pdf",
	size: 2048,
	parentDirId: "root",
	userId: "u1",
	createdAt: "2026-04-01T10:00:00Z",
	updatedAt: "2026-04-15T12:00:00Z",
};

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
