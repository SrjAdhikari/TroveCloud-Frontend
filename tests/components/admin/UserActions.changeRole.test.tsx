//* tests/components/admin/UserActions.changeRole.test.tsx

import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import { renderWithProviders } from "../../lib/render";
import server from "../../server";
import UserActions from "@/components/admin/UserActions";
import type { UserDetailPayload } from "@/types/admin.types";
import type { UserPayload, UserRole } from "@/types/auth.types";

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
const CHANGE_ROLE_URL = "http://localhost:5001/api/admin/users/:id/role";

const makeCaller = (overrides: Partial<UserPayload> = {}): UserPayload => ({
	_id: "caller-1",
	name: "Caller",
	email: "caller@example.com",
	role: "superadmin",
	rootDirId: "root-c1",
	profilePicture: null,
	provider: "email",
	isVerified: true,
	createdAt: "2026-01-01T00:00:00Z",
	updatedAt: "2026-01-01T00:00:00Z",
	...overrides,
});

const makeTarget = (
	overrides: Partial<UserDetailPayload> = {},
): UserDetailPayload => ({
	_id: "target-1",
	name: "Target",
	email: "target@example.com",
	role: "user",
	rootDirId: "root-t1",
	profilePicture: null,
	isVerified: true,
	provider: "email",
	suspendedAt: null,
	suspendedBy: null,
	deletedAt: null,
	status: "active",
	createdAt: "2026-04-12T10:30:00Z",
	updatedAt: "2026-04-12T10:30:00Z",
	stats: {
		storageBytes: 0,
		fileCount: 0,
		directoryCount: 0,
		activeSessionCount: 0,
		lastLoginAt: null,
	},
	...overrides,
});

const mockMe = (caller: UserPayload) =>
	server.use(
		http.get(ME_URL, () =>
			HttpResponse.json({ success: true, message: "ok", data: caller }),
		),
	);

const openChangeRole = async () => {
	const user = userEvent.setup();
	await user.click(await screen.findByRole("button", { name: /more/i }));
	await user.click(
		await screen.findByRole("menuitem", { name: "Change Role" }),
	);
	return user;
};

beforeEach(() => {
	vi.clearAllMocks();
});

describe("UserActions — change role", () => {
	it("renders only roles ≤ the caller's role in the Select", async () => {
		mockMe(makeCaller({ role: "superadmin" }));

		renderWithProviders(<UserActions user={makeTarget()} />);
		const user = await openChangeRole();

		const dialog = await screen.findByRole("dialog");
		await user.click(within(dialog).getByRole("combobox"));

		// All three roles available for superadmin caller. Use exact names so
		// "User" doesn't match "Superadmin", etc.
		expect(
			await screen.findByRole("option", { name: "User" }),
		).toBeInTheDocument();
		expect(screen.getByRole("option", { name: "Admin" })).toBeInTheDocument();
		expect(
			screen.getByRole("option", { name: "Superadmin" }),
		).toBeInTheDocument();
	});

	it("disables confirm when the selected role equals the current role", async () => {
		mockMe(makeCaller({ role: "superadmin" }));

		renderWithProviders(<UserActions user={makeTarget({ role: "user" })} />);
		await openChangeRole();

		const dialog = await screen.findByRole("dialog");
		// Default-selected role is the current role; confirm should start disabled.
		expect(
			within(dialog).getByRole("button", { name: "Change role" }),
		).toBeDisabled();
	});

	it("enables confirm + fires PATCH /role with the picked role after selection", async () => {
		mockMe(makeCaller({ role: "superadmin" }));
		let requestedRole: UserRole | undefined;
		server.use(
			http.patch(CHANGE_ROLE_URL, async ({ request }) => {
				const body = (await request.json()) as { role: UserRole };
				requestedRole = body.role;
				return HttpResponse.json({
					success: true,
					message: "ok",
					data: makeTarget({ role: body.role }),
				});
			}),
		);

		renderWithProviders(<UserActions user={makeTarget({ role: "user" })} />);
		const user = await openChangeRole();

		const dialog = await screen.findByRole("dialog");

		await user.click(within(dialog).getByRole("combobox"));
		await user.click(await screen.findByRole("option", { name: "Admin" }));

		const confirm = within(dialog).getByRole("button", { name: "Change role" });
		await waitFor(() => expect(confirm).toBeEnabled());

		await user.click(confirm);

		await waitFor(() => expect(requestedRole).toBe("admin"));
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
	});
});
