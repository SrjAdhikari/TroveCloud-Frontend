//* tests/pages/AdminUsersPage.test.tsx

import { describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { renderWithProviders } from "../lib/render";
import server from "../server";
import AdminUsersPage from "@/pages/AdminUsersPage";
import type { UserItemPayload } from "@/types/admin.types";

const USERS_URL = "http://localhost:5001/api/admin/users";

const makeUser = (
	id: string,
	overrides: Partial<UserItemPayload> = {},
): UserItemPayload => ({
	_id: id,
	name: `User ${id}`,
	email: `user${id}@example.com`,
	profilePicture: null,
	role: "user",
	rootDirId: `root-${id}`,
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

const successResponse = (
	items: UserItemPayload[],
	total = items.length,
	page = 1,
) => ({
	success: true,
	message: "ok",
	data: {
		items,
		pagination: {
			page,
			limit: 20,
			total,
			totalPages: Math.max(1, Math.ceil(total / 20)),
		},
	},
});

describe("AdminUsersPage", () => {
	beforeEach(() => {
		server.use(
			http.get(USERS_URL, () =>
				HttpResponse.json(successResponse([makeUser("a1"), makeUser("a2")])),
			),
		);
	});

	it("renders the users returned by the API", async () => {
		renderWithProviders(<AdminUsersPage />, {
			initialEntries: ["/admin/users"],
		});

		expect(
			await screen.findByRole("link", { name: /user a1/i }),
		).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /user a2/i })).toBeInTheDocument();
	});

	it("debounces search typing into a single request after 300ms", async () => {
		const requests: string[] = [];
		server.use(
			http.get(USERS_URL, ({ request }) => {
				requests.push(new URL(request.url).search);
				return HttpResponse.json(successResponse([makeUser("a1")]));
			}),
		);

		const user = userEvent.setup();
		renderWithProviders(<AdminUsersPage />, {
			initialEntries: ["/admin/users"],
		});
		await screen.findByRole("link", { name: /user a1/i });

		const initialRequestCount = requests.length;

		await user.type(screen.getByPlaceholderText(/search/i), "alice");
		await waitFor(
			() => {
				const qRequests = requests
					.slice(initialRequestCount)
					.filter((search) => new URLSearchParams(search).has("q"));
				expect(qRequests).toHaveLength(1);
				expect(qRequests[0]).toContain("q=alice");
			},
			{ timeout: 1500 },
		);
	});

	it("transitions to UsersLoadFailed when a refetch errors", async () => {
		let callCount = 0;
		server.use(
			http.get(USERS_URL, () => {
				callCount += 1;
				if (callCount === 1) {
					return HttpResponse.json(successResponse([makeUser("a1")]));
				}
				return HttpResponse.json(
					{
						status: "error",
						error: {
							code: "INTERNAL_ERROR",
							message: "Internal server error",
						},
					},
					{ status: 500 },
				);
			}),
		);

		const user = userEvent.setup();
		renderWithProviders(<AdminUsersPage />, {
			initialEntries: ["/admin/users"],
		});
		await screen.findByRole("link", { name: /user a1/i });

		await user.type(screen.getByPlaceholderText(/search/i), "x");

		expect(
			await screen.findByText("Unable to load users", undefined, {
				timeout: 3000,
			}),
		).toBeInTheDocument();
	});

	it("shows the first-load failure placeholder when initial fetch errors", async () => {
		server.use(
			http.get(USERS_URL, () =>
				HttpResponse.json(
					{
						status: "error",
						error: {
							code: "INSUFFICIENT_ROLE",
							message: "Insufficient permissions",
						},
					},
					{ status: 403 },
				),
			),
		);

		renderWithProviders(<AdminUsersPage />, {
			initialEntries: ["/admin/users"],
		});

		expect(await screen.findByText("Access denied")).toBeInTheDocument();
	});

	it("hydrates filter state from the URL on mount", async () => {
		const requests: string[] = [];
		server.use(
			http.get(USERS_URL, ({ request }) => {
				requests.push(new URL(request.url).search);
				return HttpResponse.json(successResponse([makeUser("a1")]));
			}),
		);

		renderWithProviders(<AdminUsersPage />, {
			initialEntries: ["/admin/users?role=admin&page=2"],
		});

		await screen.findByRole("link", { name: /user a1/i });
		expect(requests[0]).toContain("role=admin");
		expect(requests[0]).toContain("page=2");
	});
});
