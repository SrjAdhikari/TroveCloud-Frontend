//* tests/components/admin/UsersTable.dropdown.test.tsx

import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Routes, Route, useLocation } from "react-router";
import { http, HttpResponse } from "msw";

import { renderWithProviders } from "../../lib/render";
import server from "../../server";
import UsersTable from "@/components/admin/UsersTable";
import type { UserItemPayload } from "@/types/admin.types";
import type { UserPayload } from "@/types/auth.types";

vi.mock("@/lib/toast", () => ({
	default: {
		success: vi.fn(),
		undo: vi.fn(),
		info: vi.fn(),
		warning: vi.fn(),
		error: vi.fn(),
		promise: vi.fn(),
		dismiss: vi.fn(),
	},
}));

const ME_URL = "http://localhost:5001/api/auth/me";

const makeCaller = (overrides: Partial<UserPayload> = {}): UserPayload => ({
	_id: "caller-1",
	name: "Caller",
	email: "caller@example.com",
	role: "superadmin",
	rootDirId: "root-c1",
	profilePicture: null,
	isVerified: true,
	createdAt: "2026-01-01T00:00:00Z",
	updatedAt: "2026-01-01T00:00:00Z",
	...overrides,
});

const makeUser = (overrides: Partial<UserItemPayload> = {}): UserItemPayload => ({
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
	...overrides,
});

const baseProps = {
	isFetching: false,
	isFiltered: false,
	page: 1,
	totalPages: 1,
	onClearFilters: vi.fn(),
	onResetPage: vi.fn(),
};

const renderUnderRoutes = (items: UserItemPayload[]) => {
	const LocationProbe = () => {
		const location = useLocation();
		return <p data-testid="location">{location.pathname}</p>;
	};

	return renderWithProviders(
		<Routes>
			<Route
				path="/admin/users"
				element={
					<>
						<UsersTable items={items} {...baseProps} />
						<LocationProbe />
					</>
				}
			/>
			<Route path="/admin/users/:id" element={<LocationProbe />} />
		</Routes>,
		{ initialEntries: ["/admin/users"] },
	);
};

beforeEach(() => {
	vi.clearAllMocks();
	server.use(
		http.get(ME_URL, () =>
			HttpResponse.json({ success: true, message: "ok", data: makeCaller() }),
		),
	);
});

describe("UsersTable — row dropdown integration", () => {
	it("renders a More actions trigger for each non-self row", async () => {
		renderUnderRoutes([
			makeUser({ _id: "u1", name: "Alice" }),
			makeUser({ _id: "u2", name: "Bob" }),
		]);

		const triggers = await screen.findAllByRole("button", {
			name: /more actions/i,
		});
		expect(triggers).toHaveLength(2);
	});

	it("clicking the row link navigates to the detail page", async () => {
		const user = userEvent.setup();
		renderUnderRoutes([makeUser({ _id: "u1", name: "Alice Anderson" })]);

		const link = await screen.findByRole("link", { name: /alice anderson/i });
		expect(link).toHaveAttribute("href", "/admin/users/u1");

		await user.click(link);
		await waitFor(() =>
			expect(screen.getByTestId("location")).toHaveTextContent(
				"/admin/users/u1",
			),
		);
	});

	it("clicking the dropdown trigger does not navigate the row", async () => {
		const user = userEvent.setup();
		renderUnderRoutes([makeUser({ _id: "u1", name: "Alice Anderson" })]);

		await user.click(
			await screen.findByRole("button", { name: /more actions/i }),
		);

		expect(screen.getByTestId("location")).toHaveTextContent("/admin/users");
		// Sanity: the menu actually opened (so we exercised the click, not a no-op).
		expect(await screen.findByRole("menu")).toBeInTheDocument();
	});

	it("clicking a menu item opens the dialog without navigating the row", async () => {
		const user = userEvent.setup();
		renderUnderRoutes([makeUser({ _id: "u1", name: "Alice Anderson" })]);

		await user.click(
			await screen.findByRole("button", { name: /more actions/i }),
		);
		await user.click(
			await screen.findByRole("menuitem", { name: "Suspend" }),
		);

		expect(await screen.findByRole("dialog")).toBeInTheDocument();
		expect(screen.getByTestId("location")).toHaveTextContent("/admin/users");
	});
});
