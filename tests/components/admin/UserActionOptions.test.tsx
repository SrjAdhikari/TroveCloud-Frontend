//* tests/components/admin/UserActionOptions.test.tsx

import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import { renderWithProviders } from "../../lib/render";
import server from "../../server";
import UserActionOptions from "@/components/admin/UserActionOptions";
import type { UserItemPayload } from "@/types/admin.types";
import type { UserPayload } from "@/types/auth.types";

import toast from "@/lib/toast";

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
const SUSPEND_URL = "http://localhost:5001/api/admin/users/:id/suspend";
const UNSUSPEND_URL = "http://localhost:5001/api/admin/users/:id/unsuspend";
const FORCE_LOGOUT_URL = "http://localhost:5001/api/admin/users/:id/logout";

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
	overrides: Partial<UserItemPayload> = {},
): UserItemPayload => ({
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
	...overrides,
});

const mockMe = (caller: UserPayload) =>
	server.use(
		http.get(ME_URL, () =>
			HttpResponse.json({ success: true, message: "ok", data: caller }),
		),
	);

beforeEach(() => {
	vi.clearAllMocks();
});

describe("UserActionOptions — trigger visibility", () => {
	it("renders the MoreVertical trigger when caller can act on target", async () => {
		mockMe(makeCaller());

		renderWithProviders(<UserActionOptions user={makeTarget()} />);

		expect(
			await screen.findByRole("button", { name: /more actions/i }),
		).toBeInTheDocument();
	});

	it("renders nothing when target is the caller (self)", async () => {
		mockMe(makeCaller({ _id: "self" }));

		const { container } = renderWithProviders(
			<UserActionOptions user={makeTarget({ _id: "self" })} />,
		);

		await waitFor(() =>
			expect(container.querySelector("button")).toBeNull(),
		);
		expect(container).toBeEmptyDOMElement();
	});

	it("renders nothing when admin caller views an admin-role target (no actions allowed)", async () => {
		mockMe(makeCaller({ role: "admin" }));

		const { container } = renderWithProviders(
			<UserActionOptions user={makeTarget({ role: "admin" })} />,
		);

		await waitFor(() =>
			expect(container.querySelector("button")).toBeNull(),
		);
		expect(container).toBeEmptyDOMElement();
	});
});

describe("UserActionOptions — menu contents per (caller, target)", () => {
	const openMenu = async () => {
		const user = userEvent.setup();
		await user.click(
			await screen.findByRole("button", { name: /more actions/i }),
		);
		return user;
	};

	it("lists Suspend, Force Logout, Move to Trash for an active target", async () => {
		mockMe(makeCaller());

		renderWithProviders(<UserActionOptions user={makeTarget()} />);

		await openMenu();
		const menu = await screen.findByRole("menu");

		expect(within(menu).getByRole("menuitem", { name: "Suspend" })).toBeInTheDocument();
		expect(within(menu).getByRole("menuitem", { name: "Force Logout" })).toBeInTheDocument();
		expect(within(menu).getByRole("menuitem", { name: "Move to Trash" })).toBeInTheDocument();
		expect(within(menu).queryByRole("menuitem", { name: "Unsuspend" })).toBeNull();
		expect(within(menu).queryByRole("menuitem", { name: "Restore" })).toBeNull();
		expect(within(menu).queryByRole("menuitem", { name: /change role/i })).toBeNull();
		expect(within(menu).queryByRole("menuitem", { name: /delete permanently/i })).toBeNull();
	});

	it("lists Unsuspend, Force Logout, Move to Trash for a suspended target", async () => {
		mockMe(makeCaller());

		renderWithProviders(
			<UserActionOptions user={makeTarget({ status: "suspended" })} />,
		);

		await openMenu();
		const menu = await screen.findByRole("menu");

		expect(within(menu).getByRole("menuitem", { name: "Unsuspend" })).toBeInTheDocument();
		expect(within(menu).getByRole("menuitem", { name: "Force Logout" })).toBeInTheDocument();
		expect(within(menu).getByRole("menuitem", { name: "Move to Trash" })).toBeInTheDocument();
		expect(within(menu).queryByRole("menuitem", { name: "Suspend" })).toBeNull();
	});

	it("lists only Restore for a soft-deleted target", async () => {
		mockMe(makeCaller());

		renderWithProviders(
			<UserActionOptions
				user={makeTarget({
					status: "deleted",
					deletedAt: "2026-05-01T00:00:00Z",
				})}
			/>,
		);

		await openMenu();
		const menu = await screen.findByRole("menu");

		expect(within(menu).getByRole("menuitem", { name: "Restore" })).toBeInTheDocument();
		expect(within(menu).queryByRole("menuitem", { name: "Force Logout" })).toBeNull();
		expect(within(menu).queryByRole("menuitem", { name: "Move to Trash" })).toBeNull();
	});

	it("lists only Force Logout when an admin caller views a user-role target", async () => {
		mockMe(makeCaller({ role: "admin" }));

		renderWithProviders(<UserActionOptions user={makeTarget()} />);

		await openMenu();
		const menu = await screen.findByRole("menu");

		expect(within(menu).getByRole("menuitem", { name: "Force Logout" })).toBeInTheDocument();
		expect(within(menu).queryByRole("menuitem", { name: "Suspend" })).toBeNull();
		expect(within(menu).queryByRole("menuitem", { name: "Move to Trash" })).toBeNull();
	});
});

describe("UserActionOptions — dialog open + mutation fire", () => {
	const okResponse = (target: UserItemPayload) => ({
		success: true,
		message: "ok",
		data: target,
	});

	it("clicking Suspend opens the Suspend dialog; confirm fires PATCH /suspend silently", async () => {
		mockMe(makeCaller());
		let suspendRequested = false;
		server.use(
			http.patch(SUSPEND_URL, () => {
				suspendRequested = true;
				return HttpResponse.json(
					okResponse(makeTarget({ status: "suspended" })),
				);
			}),
		);

		const user = userEvent.setup();
		renderWithProviders(<UserActionOptions user={makeTarget()} />);

		await user.click(
			await screen.findByRole("button", { name: /more actions/i }),
		);
		await user.click(
			await screen.findByRole("menuitem", { name: "Suspend" }),
		);

		const dialog = await screen.findByRole("dialog");
		expect(within(dialog).getByText("Suspend user")).toBeInTheDocument();

		await user.click(
			within(dialog).getByRole("button", { name: "Suspend" }),
		);

		await waitFor(() => expect(suspendRequested).toBe(true));
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

		expect(toast.success).not.toHaveBeenCalled();
		expect(toast.undo).not.toHaveBeenCalled();
	});

	it("clicking Unsuspend on a suspended target fires PATCH /unsuspend silently", async () => {
		mockMe(makeCaller());
		let unsuspendRequested = false;
		server.use(
			http.patch(UNSUSPEND_URL, () => {
				unsuspendRequested = true;
				return HttpResponse.json(
					okResponse(makeTarget({ status: "active" })),
				);
			}),
		);

		const user = userEvent.setup();
		renderWithProviders(
			<UserActionOptions user={makeTarget({ status: "suspended" })} />,
		);

		await user.click(
			await screen.findByRole("button", { name: /more actions/i }),
		);
		await user.click(
			await screen.findByRole("menuitem", { name: "Unsuspend" }),
		);

		const dialog = await screen.findByRole("dialog");
		await user.click(
			within(dialog).getByRole("button", { name: "Unsuspend" }),
		);

		await waitFor(() => expect(unsuspendRequested).toBe(true));
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		expect(toast.success).not.toHaveBeenCalled();
		expect(toast.undo).not.toHaveBeenCalled();
	});

	it("clicking Force Logout opens the dialog; confirm fires POST /logout and toasts", async () => {
		mockMe(makeCaller());
		let forceLogoutRequested = false;
		server.use(
			http.post(FORCE_LOGOUT_URL, () => {
				forceLogoutRequested = true;
				return HttpResponse.json({
					success: true,
					message: "ok",
					data: { sessionsRevoked: 2 },
				});
			}),
		);

		const user = userEvent.setup();
		renderWithProviders(<UserActionOptions user={makeTarget()} />);

		await user.click(
			await screen.findByRole("button", { name: /more actions/i }),
		);
		await user.click(
			await screen.findByRole("menuitem", { name: "Force Logout" }),
		);

		const dialog = await screen.findByRole("dialog");
		await user.click(
			within(dialog).getByRole("button", { name: /end sessions/i }),
		);

		await waitFor(() => expect(forceLogoutRequested).toBe(true));
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		expect(toast.success).toHaveBeenCalledWith(
			expect.stringMatching(/sessions/i),
		);
	});

	it("clicking Restore on a deleted target fires POST /restore and toasts", async () => {
		mockMe(makeCaller());
		let restoreRequested = false;
		server.use(
			http.post(
				"http://localhost:5001/api/admin/users/:id/restore",
				() => {
					restoreRequested = true;
					return HttpResponse.json(okResponse(makeTarget()));
				},
			),
		);

		const user = userEvent.setup();
		renderWithProviders(
			<UserActionOptions
				user={makeTarget({
					status: "deleted",
					deletedAt: "2026-05-01T00:00:00Z",
				})}
			/>,
		);

		await user.click(
			await screen.findByRole("button", { name: /more actions/i }),
		);
		await user.click(
			await screen.findByRole("menuitem", { name: "Restore" }),
		);

		const dialog = await screen.findByRole("dialog");
		await user.click(
			within(dialog).getByRole("button", { name: "Restore" }),
		);

		await waitFor(() => expect(restoreRequested).toBe(true));
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		expect(toast.success).toHaveBeenCalledWith(
			expect.stringMatching(/restored/i),
		);
	});

	it("clicking Move to Trash fires DELETE /soft-delete silently", async () => {
		mockMe(makeCaller());
		let softDeleteRequested = false;
		server.use(
			http.delete(
				"http://localhost:5001/api/admin/users/:id/soft-delete",
				() => {
					softDeleteRequested = true;
					return HttpResponse.json(
						okResponse(makeTarget({ status: "deleted" })),
					);
				},
			),
		);

		const user = userEvent.setup();
		renderWithProviders(<UserActionOptions user={makeTarget()} />);

		await user.click(
			await screen.findByRole("button", { name: /more actions/i }),
		);
		await user.click(
			await screen.findByRole("menuitem", { name: "Move to Trash" }),
		);

		const dialog = await screen.findByRole("dialog");
		await user.click(
			within(dialog).getByRole("button", { name: /move to trash/i }),
		);

		await waitFor(() => expect(softDeleteRequested).toBe(true));
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		expect(toast.success).not.toHaveBeenCalled();
		expect(toast.undo).not.toHaveBeenCalled();
	});
});
