//* tests/components/dashboard/directory/DirectoryGridView.test.tsx

import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";

import { renderWithProviders } from "../../../lib/render";
import DirectoryGridView from "@/components/dashboard/directory/DirectoryGridView";
import type {
	DirectoryItemPayload,
	FileItemPayload,
} from "@/types/directory.types";

const folder: DirectoryItemPayload = {
	_id: "f1",
	name: "Reports",
	parentDirId: "root",
	userId: "u1",
	fileCount: 3,
	totalSize: 1024,
	createdAt: "2026-04-01T10:00:00Z",
	updatedAt: "2026-04-15T12:00:00Z",
};

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

describe("DirectoryGridView", () => {
	it("renders a folder card under 'Folders' and a file card under 'Files'", () => {
		renderWithProviders(
			<DirectoryGridView
				folders={[folder]}
				files={[file]}
				currentPath="/My Files"
			/>,
		);

		expect(
			screen.getByRole("heading", { name: "Folders" }),
		).toBeInTheDocument();
		expect(screen.getByText("Reports")).toBeInTheDocument();

		expect(screen.getByRole("heading", { name: "Files" })).toBeInTheDocument();
		// Grid view splits the file name so the extension survives truncation.
		expect(screen.getByText("report")).toBeInTheDocument();
		expect(screen.getByText(".pdf")).toBeInTheDocument();
	});

	it("omits the 'Folders' section when there are no folders", () => {
		renderWithProviders(
			<DirectoryGridView folders={[]} files={[file]} currentPath="/My Files" />,
		);

		expect(screen.queryByRole("heading", { name: "Folders" })).toBeNull();
		expect(screen.getByRole("heading", { name: "Files" })).toBeInTheDocument();
	});

	it("omits the 'Files' section when there are no files", () => {
		renderWithProviders(
			<DirectoryGridView
				folders={[folder]}
				files={[]}
				currentPath="/My Files"
			/>,
		);

		expect(
			screen.getByRole("heading", { name: "Folders" }),
		).toBeInTheDocument();
		expect(screen.queryByRole("heading", { name: "Files" })).toBeNull();
	});
});
