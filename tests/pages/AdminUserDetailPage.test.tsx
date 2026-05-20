//* tests/pages/AdminUserDetailPage.test.tsx

import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { Routes, Route } from "react-router";
import { http, HttpResponse } from "msw";

import { renderWithProviders } from "../lib/render";
import server from "../server";
import AdminUserDetailPage from "@/pages/AdminUserDetailPage";
import type { UserDetailPayload } from "@/types/admin.types";

const USER_DETAIL_URL = "http://localhost:5001/api/admin/users/:userId";

const makeUserDetail = (
	overrides: Partial<UserDetailPayload> = {},
): UserDetailPayload => ({
	_id: "u1",
	name: "Ada Lovelace",
	email: "ada@example.com",
	profilePicture: null,
	role: "admin",
	rootDirId: "root-u1",
	isVerified: true,
	provider: "email",
	suspendedAt: null,
	suspendedBy: null,
	deletedAt: null,
	status: "active",
	createdAt: "2026-04-12T12:00:00Z",
	updatedAt: "2026-04-15T12:00:00Z",
	stats: {
		storageBytes: 2_500_000_000,
		fileCount: 1247,
		directoryCount: 38,
		activeSessionCount: 2,
		lastLoginAt: "2026-05-19T12:00:00Z",
	},
	...overrides,
});

const successResponse = (user: UserDetailPayload) => ({
	success: true,
	message: "ok",
	data: user,
});

const renderRoute = (path = "/admin/users/u1") =>
	renderWithProviders(
		<Routes>
			<Route path="/admin/users/:id" element={<AdminUserDetailPage />} />
		</Routes>,
		{ initialEntries: [path] },
	);

describe("AdminUserDetailPage", () => {
	beforeEach(() => {
		server.use(
			http.get(USER_DETAIL_URL, () =>
				HttpResponse.json(successResponse(makeUserDetail())),
			),
		);
	});

	it("shows the loading spinner while the query is in flight", () => {
		renderRoute();

		expect(screen.getByText("Loading...")).toBeInTheDocument();
		expect(screen.queryByText("Ada Lovelace")).toBeNull();
	});

	it("composes the hero + profile card + activity card on success", async () => {
		renderRoute();

		// Hero — h1, status pill, role badge, and joined date
		expect(
			await screen.findByRole("heading", { level: 1, name: "Ada Lovelace" }),
		).toBeInTheDocument();
		expect(screen.getByText("Active")).toBeInTheDocument();
		expect(screen.getByText("Admin")).toBeInTheDocument();
		expect(screen.getByText(/Joined Apr 12, 2026/)).toBeInTheDocument();

		// Both cards present via their kicker labels
		expect(screen.getByText("Profile")).toBeInTheDocument();
		expect(screen.getByText("Activity")).toBeInTheDocument();
	});

	it("renders UserDetailLoadFailed on USER_NOT_FOUND", async () => {
		server.use(
			http.get(USER_DETAIL_URL, () =>
				HttpResponse.json(
					{
						status: "fail",
						error: { code: "USER_NOT_FOUND", message: "irrelevant" },
					},
					{ status: 404 },
				),
			),
		);

		renderRoute();

		expect(
			await screen.findByText("This user no longer exists"),
		).toBeInTheDocument();
	});

	it("renders the fallback placeholder when the API returns a 5xx", async () => {
		server.use(
			http.get(USER_DETAIL_URL, () =>
				HttpResponse.json(
					{
						status: "error",
						error: { code: "INTERNAL_ERROR", message: "fail" },
					},
					{ status: 500 },
				),
			),
		);

		renderRoute();

		expect(
			await screen.findByText("Unable to load this user"),
		).toBeInTheDocument();
	});

	it("renders the StatusBadge as 'Deleted' for soft-deleted users", async () => {
		server.use(
			http.get(USER_DETAIL_URL, () =>
				HttpResponse.json(
					successResponse(
						makeUserDetail({
							status: "deleted",
							deletedAt: "2026-05-01T00:00:00Z",
						}),
					),
				),
			),
		);

		renderRoute();

		expect(await screen.findByText("Deleted")).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { level: 1, name: "Ada Lovelace" }),
		).toBeInTheDocument();
	});
});
