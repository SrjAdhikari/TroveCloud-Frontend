//* tests/components/dashboard/cards/FolderCard.test.tsx

import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocation } from "react-router";

import { renderWithProviders } from "../../../lib/render";
import FolderCard from "@/components/dashboard/cards/FolderCard";
import type { DirectoryItemPayload } from "@/types/directory.types";

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

const renderListRow = () => {
	const LocationProbe = () => {
		const location = useLocation();
		return (
			<p data-testid="location">{`${location.pathname}${location.search}`}</p>
		);
	};

	return renderWithProviders(
		<>
			<FolderCard folder={folder} view="list" currentPath="/My Files" />
			<LocationProbe />
		</>,
		{ initialEntries: ["/my-files"] },
	);
};

describe("FolderCard — list view", () => {
	it("renders the row as a link with ?dir={id} href", () => {
		renderListRow();
		const link = screen.getByRole("link", { name: /reports/i });
		expect(link.getAttribute("href")).toContain("?dir=f1");
	});

	it("clicking the row link updates the dir search param", async () => {
		const user = userEvent.setup();
		renderListRow();

		await user.click(screen.getByRole("link", { name: /reports/i }));
		await waitFor(() =>
			expect(screen.getByTestId("location")).toHaveTextContent(
				"/my-files?dir=f1",
			),
		);
	});

	it("clicking the More actions trigger does not navigate the row", async () => {
		const user = userEvent.setup();
		renderListRow();

		await user.click(screen.getByRole("button", { name: /more actions/i }));

		expect(screen.getByTestId("location")).toHaveTextContent("/my-files");
		expect(screen.getByTestId("location")).not.toHaveTextContent("?dir=");
		// Sanity: the menu actually opened (so we exercised the click).
		expect(await screen.findByRole("menu")).toBeInTheDocument();
	});

	it("opening Details shows the folder's full path", async () => {
		const user = userEvent.setup();
		renderWithProviders(
			<FolderCard folder={folder} view="list" currentPath="/My Files" />,
		);

		await user.click(screen.getByRole("button", { name: /more actions/i }));
		await user.click(
			await screen.findByRole("menuitem", { name: /details/i }),
		);

		expect(await screen.findByText("/My Files/Reports")).toBeInTheDocument();
	});
});
