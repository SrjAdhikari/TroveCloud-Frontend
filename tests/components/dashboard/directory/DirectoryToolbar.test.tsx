//* tests/components/dashboard/directory/DirectoryToolbar.test.tsx

import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithRouter } from "../../../lib/render";
import DirectoryToolbar from "@/components/dashboard/directory/DirectoryToolbar";

const renderToolbar = (view: "grid" | "list" = "grid") => {
	const props = {
		view,
		onNewFolder: vi.fn(),
		onUploadFiles: vi.fn(),
		onImportFromDrive: vi.fn(),
		onToggleView: vi.fn(),
	};
	renderWithRouter(<DirectoryToolbar {...props} />);
	return props;
};

describe("DirectoryToolbar — accessible names", () => {
	it("names every icon-only action in the accessibility tree", () => {
		renderToolbar();

		expect(
			screen.getByRole("button", { name: "New Folder" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Upload Files" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Upload Folder — Coming soon" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Import from Drive" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Grid view" }),
		).toBeInTheDocument();
	});

	it("routes each named button to its own handler", async () => {
		const user = userEvent.setup();
		const props = renderToolbar();

		await user.click(screen.getByRole("button", { name: "New Folder" }));
		await user.click(screen.getByRole("button", { name: "Upload Files" }));
		await user.click(screen.getByRole("button", { name: "Import from Drive" }));
		await user.click(screen.getByRole("button", { name: "Grid view" }));

		expect(props.onNewFolder).toHaveBeenCalledTimes(1);
		expect(props.onUploadFiles).toHaveBeenCalledTimes(1);
		expect(props.onImportFromDrive).toHaveBeenCalledTimes(1);
		expect(props.onToggleView).toHaveBeenCalledTimes(1);
	});
});

describe("DirectoryToolbar — control state", () => {
	it("exposes the view toggle as pressed while the grid view is active", () => {
		renderToolbar("grid");

		expect(screen.getByRole("button", { name: "Grid view" })).toHaveAttribute(
			"aria-pressed",
			"true",
		);
	});

	it("exposes the view toggle as not pressed while the list view is active", () => {
		renderToolbar("list");

		expect(screen.getByRole("button", { name: "Grid view" })).toHaveAttribute(
			"aria-pressed",
			"false",
		);
	});

	// Kept enabled so its tooltip stays reachable — `disabled` suppresses pointer
	// events, which would hide the only place "Coming soon" is explained.
	it("keeps the not-yet-built folder upload reachable", () => {
		renderToolbar();

		expect(
			screen.getByRole("button", { name: "Upload Folder — Coming soon" }),
		).toBeEnabled();
	});
});
