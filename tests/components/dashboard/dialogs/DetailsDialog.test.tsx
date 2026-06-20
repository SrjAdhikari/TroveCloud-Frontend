//* tests/components/dashboard/dialogs/DetailsDialog.test.tsx

import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";

import { renderWithProviders } from "../../../lib/render";
import { formatDateTime } from "@/lib/formatters";
import DetailsDialog from "@/components/dashboard/dialogs/DetailsDialog";
import type {
	DirectoryItemPayload,
	FileItemPayload,
} from "@/types/directory.types";

const file: FileItemPayload = {
	_id: "file1",
	name: "report.pdf",
	extension: ".pdf",
	size: 2048,
	parentDirId: "d1",
	userId: "u1",
	createdAt: "2026-04-01T10:00:00Z",
	updatedAt: "2026-04-15T12:00:00Z",
};

describe("DetailsDialog — file", () => {
	it("shows the full path derived from the parent path and file name", () => {
		renderWithProviders(
			<DetailsDialog
				onClose={vi.fn()}
				currentPath="/My Files/Documents"
				type="file"
				item={file}
			/>,
		);

		expect(
			screen.getByText("/My Files/Documents/report.pdf"),
		).toBeInTheDocument();
	});

	it("shows size, and the full date-time for Created and Modified", () => {
		renderWithProviders(
			<DetailsDialog
				onClose={vi.fn()}
				currentPath="/My Files/Documents"
				type="file"
				item={file}
			/>,
		);

		expect(screen.getByText("2.0 KB")).toBeInTheDocument();
		expect(screen.getByText("Created")).toBeInTheDocument();
		expect(screen.getByText("Modified")).toBeInTheDocument();
		// Same format as the file/folder cards (date + time), not date-only.
		expect(
			screen.getByText(formatDateTime(file.createdAt)),
		).toBeInTheDocument();
		expect(
			screen.getByText(formatDateTime(file.updatedAt)),
		).toBeInTheDocument();
	});
});

const folder: DirectoryItemPayload = {
	_id: "f1",
	name: "Reports",
	parentDirId: "d1",
	userId: "u1",
	fileCount: 12,
	folderCount: 3,
	totalSize: 48_000_000,
	createdAt: "2026-04-01T10:00:00Z",
	updatedAt: "2026-04-15T12:00:00Z",
};

describe("DetailsDialog — folder", () => {
	it("shows the full path derived from the parent path and folder name", () => {
		renderWithProviders(
			<DetailsDialog
				onClose={vi.fn()}
				currentPath="/My Files/Documents"
				type="folder"
				item={folder}
			/>,
		);

		expect(screen.getByText("/My Files/Documents/Reports")).toBeInTheDocument();
	});

	it("shows the file count, folder count, and total size", () => {
		renderWithProviders(
			<DetailsDialog
				onClose={vi.fn()}
				currentPath="/My Files/Documents"
				type="folder"
				item={folder}
			/>,
		);

		expect(screen.getByText("Files")).toBeInTheDocument();
		expect(screen.getByText("12")).toBeInTheDocument();
		expect(screen.getByText("Folders")).toBeInTheDocument();
		expect(screen.getByText("3")).toBeInTheDocument();
		expect(screen.getByText("48 MB")).toBeInTheDocument();
	});

	it("renders a path too long for one line as a wrapping block, in full", () => {
		const deepPath = "/My Files/Documents/Projects/2026/Q2/Reports";

		renderWithProviders(
			<DetailsDialog
				onClose={vi.fn()}
				currentPath={deepPath}
				type="folder"
				item={folder}
			/>,
		);

		const pathEl = screen.getByText(`${deepPath}/${folder.name}`);
		expect(pathEl).toBeInTheDocument();
		expect(pathEl).toHaveClass("break-all");
	});

	it("keeps a short path inline, not in the wrapping block", () => {
		renderWithProviders(
			<DetailsDialog
				onClose={vi.fn()}
				currentPath="/My Files/Documents"
				type="folder"
				item={folder}
			/>,
		);

		expect(
			screen.getByText("/My Files/Documents/Reports"),
		).not.toHaveClass("break-all");
	});

	it("falls back to — for the folder count when the backend omits it", () => {
		const withoutCount: DirectoryItemPayload = {
			_id: "f2",
			name: "Empty",
			parentDirId: "d1",
			userId: "u1",
			fileCount: 0,
			totalSize: 0,
			createdAt: "2026-04-01T10:00:00Z",
			updatedAt: "2026-04-15T12:00:00Z",
		};

		renderWithProviders(
			<DetailsDialog
				onClose={vi.fn()}
				currentPath="/My Files/Documents"
				type="folder"
				item={withoutCount}
			/>,
		);

		expect(screen.getByText("Folders")).toBeInTheDocument();
		expect(screen.getByText("—")).toBeInTheDocument();
	});
});
