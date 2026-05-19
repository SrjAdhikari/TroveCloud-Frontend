//* tests/components/admin/UsersTable.test.tsx

import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "../../lib/render";
import UsersTable from "@/components/admin/UsersTable";
import type { UserItemPayload } from "@/types/admin.types";

const sampleUser: UserItemPayload = {
	_id: "u1",
	name: "Alice Anderson",
	email: "alice@example.com",
	profilePicture: null,
	role: "user",
	rootDirId: "root-u1",
	isVerified: true,
	provider: "email",
	suspendedAt: null,
	suspendedBy: null,
	deletedAt: null,
	status: "active",
	createdAt: "2026-04-12T10:30:00Z",
	updatedAt: "2026-04-12T10:30:00Z",
};

const baseProps = {
	items: [sampleUser],
	isFetching: false,
	isFiltered: false,
	page: 1,
	totalPages: 1,
	onClearFilters: vi.fn(),
	onResetPage: vi.fn(),
};

describe("UsersTable", () => {
	it("renders a row per user with a link to the detail page", () => {
		renderWithRouter(<UsersTable {...baseProps} />);
		const link = screen.getByRole("link", { name: /alice anderson/i });
		expect(link).toHaveAttribute("href", "/admin/users/u1");
	});

	it("renders the provider glyph for each row", () => {
		const { container } = renderWithRouter(<UsersTable {...baseProps} />);
		// Sample user has provider: "email" — ProviderIcon exposes the label via title.
		expect(container.querySelector("span[title='Email']")).toBeTruthy();
	});

	it("shows 'No users yet.' when items are empty and no filters are active", () => {
		renderWithRouter(<UsersTable {...baseProps} items={[]} />);
		expect(screen.getByText("No users yet.")).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /clear filters/i }),
		).toBeNull();
	});

	it("shows the filtered-empty state with a Clear filters button when filters are active", async () => {
		const user = userEvent.setup();
		const onClearFilters = vi.fn();
		renderWithRouter(
			<UsersTable
				{...baseProps}
				items={[]}
				isFiltered
				onClearFilters={onClearFilters}
			/>,
		);

		expect(
			screen.getByText("No users match these filters."),
		).toBeInTheDocument();

		await user.click(
			screen.getByRole("button", { name: /clear filters/i }),
		);
		expect(onClearFilters).toHaveBeenCalledTimes(1);
	});

	it("shows the page-out-of-range empty state with a Back to page 1 button", async () => {
		const user = userEvent.setup();
		const onResetPage = vi.fn();
		renderWithRouter(
			<UsersTable
				{...baseProps}
				items={[]}
				page={5}
				totalPages={2}
				onResetPage={onResetPage}
			/>,
		);

		expect(screen.getByText("No users on this page.")).toBeInTheDocument();

		await user.click(
			screen.getByRole("button", { name: /back to page 1/i }),
		);
		expect(onResetPage).toHaveBeenCalledTimes(1);
	});

	it("dims the table section while isFetching is true", () => {
		const { container } = renderWithRouter(
			<UsersTable {...baseProps} isFetching />,
		);
		expect(container.querySelector("section")).toHaveClass("opacity-60");
	});

	it("does not dim the table when isFetching is false", () => {
		const { container } = renderWithRouter(<UsersTable {...baseProps} />);
		expect(container.querySelector("section")).not.toHaveClass("opacity-60");
	});
});
