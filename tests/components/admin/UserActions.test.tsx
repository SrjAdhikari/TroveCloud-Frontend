//* tests/components/admin/UserActions.test.tsx

import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { Routes, Route, useLocation } from "react-router";

import { renderWithProviders } from "../../lib/render";
import server from "../../server";
import UserActions from "@/components/admin/UserActions";
import type { UserDetailPayload } from "@/types/admin.types";
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
const SOFT_DELETE_URL = "http://localhost:5001/api/admin/users/:id/soft-delete";
const RESTORE_URL = "http://localhost:5001/api/admin/users/:id/restore";
const HARD_DELETE_URL = "http://localhost:5001/api/admin/users/:id/hard-delete";

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

const okResponse = (target: UserDetailPayload) => ({
	success: true,
	message: "ok",
	data: target,
});

beforeEach(() => {
	vi.clearAllMocks();
});

describe("UserActions — primary CTA by target status", () => {
	it("renders the Suspend primary CTA for an active target", async () => {
		mockMe(makeCaller());

		renderWithProviders(<UserActions user={makeTarget()} />);

		expect(
			await screen.findByRole("button", { name: "Suspend" }),
		).toBeInTheDocument();
	});

	it("renders the Unsuspend primary CTA for a suspended target", async () => {
		mockMe(makeCaller());

		renderWithProviders(
			<UserActions user={makeTarget({ status: "suspended" })} />,
		);

		expect(
			await screen.findByRole("button", { name: "Unsuspend" }),
		).toBeInTheDocument();
	});

	it("renders the Restore primary CTA for a soft-deleted target", async () => {
		mockMe(makeCaller());

		renderWithProviders(
			<UserActions
				user={makeTarget({
					status: "deleted",
					deletedAt: "2026-05-01T00:00:00Z",
				})}
			/>,
		);

		expect(
			await screen.findByRole("button", { name: "Restore" }),
		).toBeInTheDocument();
	});
});

describe("UserActions — visibility gating", () => {
	it("renders nothing when the target is the caller", async () => {
		mockMe(makeCaller({ _id: "self" }));

		const { container } = renderWithProviders(
			<UserActions user={makeTarget({ _id: "self" })} />,
		);

		// Wait long enough for useCurrentUser to resolve, then assert no chrome rendered.
		await waitFor(() =>
			expect(container.querySelector("button")).toBeNull(),
		);
		// Sanity: no headings, links, or menus either.
		expect(container).toBeEmptyDOMElement();
	});

	it("renders nothing when an admin caller views an admin-role target", async () => {
		mockMe(makeCaller({ role: "admin" }));

		const { container } = renderWithProviders(
			<UserActions user={makeTarget({ role: "admin" })} />,
		);

		await waitFor(() =>
			expect(container.querySelector("button")).toBeNull(),
		);
		expect(container).toBeEmptyDOMElement();
	});

	it("collapses to a single Force logout button when admin views a user-role target", async () => {
		mockMe(makeCaller({ role: "admin" }));

		renderWithProviders(<UserActions user={makeTarget()} />);

		expect(
			await screen.findByRole("button", { name: "Force Logout" }),
		).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Suspend" })).toBeNull();
		expect(screen.queryByRole("button", { name: /more/i })).toBeNull();
	});
});

describe("UserActions — More dropdown contents", () => {
	const openMore = async () => {
		const user = userEvent.setup();
		await user.click(await screen.findByRole("button", { name: /more/i }));
		return user;
	};

	it("lists Change role, Force logout, Move to trash, Permanently delete for an active target", async () => {
		mockMe(makeCaller());

		renderWithProviders(<UserActions user={makeTarget()} />);

		await openMore();

		const menu = await screen.findByRole("menu");
		expect(within(menu).getByRole("menuitem", { name: "Change Role" })).toBeInTheDocument();
		expect(within(menu).getByRole("menuitem", { name: "Force Logout" })).toBeInTheDocument();
		expect(within(menu).getByRole("menuitem", { name: "Move to Trash" })).toBeInTheDocument();
		expect(within(menu).getByRole("menuitem", { name: /delete permanently/i })).toBeInTheDocument();
	});

	it("shows the same More items for a suspended target", async () => {
		mockMe(makeCaller());

		renderWithProviders(
			<UserActions user={makeTarget({ status: "suspended" })} />,
		);

		await openMore();

		const menu = await screen.findByRole("menu");
		expect(within(menu).getByRole("menuitem", { name: "Change Role" })).toBeInTheDocument();
		expect(within(menu).getByRole("menuitem", { name: "Force Logout" })).toBeInTheDocument();
		expect(within(menu).getByRole("menuitem", { name: "Move to Trash" })).toBeInTheDocument();
		expect(within(menu).getByRole("menuitem", { name: /delete permanently/i })).toBeInTheDocument();
	});

	it("collapses More to only Permanently delete for a soft-deleted target", async () => {
		mockMe(makeCaller());

		renderWithProviders(
			<UserActions
				user={makeTarget({
					status: "deleted",
					deletedAt: "2026-05-01T00:00:00Z",
				})}
			/>,
		);

		await openMore();

		const menu = await screen.findByRole("menu");
		expect(within(menu).getByRole("menuitem", { name: /delete permanently/i })).toBeInTheDocument();
		expect(within(menu).queryByRole("menuitem", { name: "Change Role" })).toBeNull();
		expect(within(menu).queryByRole("menuitem", { name: "Force Logout" })).toBeNull();
		expect(within(menu).queryByRole("menuitem", { name: "Move to Trash" })).toBeNull();
	});
});

describe("UserActions — dialog open + mutation fire", () => {
	it("clicking Suspend opens the Suspend dialog and confirm fires PATCH /suspend", async () => {
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
		renderWithProviders(<UserActions user={makeTarget()} />);

		await user.click(await screen.findByRole("button", { name: "Suspend" }));

		const dialog = await screen.findByRole("dialog");
		expect(within(dialog).getByText("Suspend user")).toBeInTheDocument();

		await user.click(
			within(dialog).getByRole("button", { name: "Suspend" }),
		);

		await waitFor(() => expect(suspendRequested).toBe(true));

		// Dialog auto-closes after success (ConfirmActionDialog calls onClose).
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
	});

	it("suspend is silent — no toast fires on success", async () => {
		mockMe(makeCaller());
		server.use(
			http.patch(SUSPEND_URL, () =>
				HttpResponse.json(okResponse(makeTarget({ status: "suspended" }))),
			),
		);

		const user = userEvent.setup();
		renderWithProviders(<UserActions user={makeTarget()} />);

		await user.click(await screen.findByRole("button", { name: "Suspend" }));
		const dialog = await screen.findByRole("dialog");
		await user.click(
			within(dialog).getByRole("button", { name: "Suspend" }),
		);
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

		expect(toast.success).not.toHaveBeenCalled();
		expect(toast.undo).not.toHaveBeenCalled();
		expect(toast.info).not.toHaveBeenCalled();
	});

	it("unsuspend fires PATCH /unsuspend silently from the suspended-target primary CTA", async () => {
		mockMe(makeCaller());
		let unsuspendRequested = false;
		server.use(
			http.patch(UNSUSPEND_URL, () => {
				unsuspendRequested = true;
				return HttpResponse.json(okResponse(makeTarget({ status: "active" })));
			}),
		);

		const user = userEvent.setup();
		renderWithProviders(
			<UserActions user={makeTarget({ status: "suspended" })} />,
		);

		await user.click(await screen.findByRole("button", { name: "Unsuspend" }));
		const dialog = await screen.findByRole("dialog");
		await user.click(
			within(dialog).getByRole("button", { name: "Unsuspend" }),
		);

		await waitFor(() => expect(unsuspendRequested).toBe(true));
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		expect(toast.success).not.toHaveBeenCalled();
	});

	it("force logout fires POST /logout and triggers a success toast", async () => {
		mockMe(makeCaller());
		let forceLogoutRequested = false;
		server.use(
			http.post(FORCE_LOGOUT_URL, () => {
				forceLogoutRequested = true;
				return HttpResponse.json({
					success: true,
					message: "ok",
					data: { sessionsRevoked: 3 },
				});
			}),
		);

		const user = userEvent.setup();
		renderWithProviders(<UserActions user={makeTarget()} />);

		// Open More dropdown, click "Force logout"
		await user.click(await screen.findByRole("button", { name: /more/i }));
		await user.click(
			await screen.findByRole("menuitem", { name: "Force Logout" }),
		);

		const dialog = await screen.findByRole("dialog");
		await user.click(
			within(dialog).getByRole("button", { name: /end sessions/i }),
		);

		await waitFor(() => expect(forceLogoutRequested).toBe(true));
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/sessions/i));
	});

	it("soft delete fires DELETE /soft-delete silently — UI cue is the StatusBadge + CTA flip", async () => {
		mockMe(makeCaller());
		let softDeleteRequested = false;
		server.use(
			http.delete(SOFT_DELETE_URL, () => {
				softDeleteRequested = true;
				return HttpResponse.json(
					okResponse(makeTarget({ status: "deleted" })),
				);
			}),
		);

		const user = userEvent.setup();
		renderWithProviders(<UserActions user={makeTarget()} />);

		await user.click(await screen.findByRole("button", { name: /more/i }));
		await user.click(
			await screen.findByRole("menuitem", { name: "Move to Trash" }),
		);

		const dialog = await screen.findByRole("dialog");
		await user.click(
			within(dialog).getByRole("button", { name: /move to trash/i }),
		);

		await waitFor(() => expect(softDeleteRequested).toBe(true));
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		expect(toast.undo).not.toHaveBeenCalled();
		expect(toast.success).not.toHaveBeenCalled();
	});

	it("restore primary CTA fires POST /restore and triggers a success toast", async () => {
		mockMe(makeCaller());
		let restoreRequested = false;
		server.use(
			http.post(RESTORE_URL, () => {
				restoreRequested = true;
				return HttpResponse.json(okResponse(makeTarget()));
			}),
		);

		const user = userEvent.setup();
		renderWithProviders(
			<UserActions
				user={makeTarget({
					status: "deleted",
					deletedAt: "2026-05-01T00:00:00Z",
				})}
			/>,
		);

		await user.click(await screen.findByRole("button", { name: "Restore" }));
		const dialog = await screen.findByRole("dialog");
		await user.click(
			within(dialog).getByRole("button", { name: "Restore" }),
		);

		await waitFor(() => expect(restoreRequested).toBe(true));
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/restored/i));
	});
});

describe("UserActions — hard delete", () => {
	const renderUnderRoute = (target: UserDetailPayload) => {
		const LocationProbe = () => {
			const location = useLocation();
			return <p data-testid="location">{location.pathname}</p>;
		};

		return renderWithProviders(
			<Routes>
				<Route
					path="/admin/users/:id"
					element={
						<>
							<UserActions user={target} />
							<LocationProbe />
						</>
					}
				/>
				<Route
					path="/admin/users"
					element={<LocationProbe />}
				/>
			</Routes>,
			{ initialEntries: ["/admin/users/target-1"] },
		);
	};

	it("requires the typed email to match before confirm enables, then fires DELETE /hard-delete and navigates to /admin/users", async () => {
		mockMe(makeCaller());
		let hardDeleteRequested = false;
		server.use(
			http.delete(HARD_DELETE_URL, () => {
				hardDeleteRequested = true;
				return HttpResponse.json({
					success: true,
					message: "ok",
					data: {
						filesDeleted: 0,
						directoriesDeleted: 0,
						bytesFreed: 0,
					},
				});
			}),
		);

		const user = userEvent.setup();
		const target = makeTarget({ email: "victim@example.com" });
		renderUnderRoute(target);

		await user.click(await screen.findByRole("button", { name: /more/i }));
		await user.click(
			await screen.findByRole("menuitem", { name: /delete permanently/i }),
		);

		const dialog = await screen.findByRole("dialog");
		const confirm = within(dialog).getByRole("button", { name: "Delete" });
		expect(confirm).toBeDisabled();

		await user.type(
			within(dialog).getByLabelText(/type the user's email/i),
			"victim@example.com",
		);
		expect(confirm).toBeEnabled();

		await user.click(confirm);

		await waitFor(() => expect(hardDeleteRequested).toBe(true));

		await waitFor(() =>
			expect(screen.getByTestId("location")).toHaveTextContent("/admin/users"),
		);
		expect(toast.success).toHaveBeenCalledWith(
			expect.stringMatching(/permanently deleted/i),
		);
	});
});
