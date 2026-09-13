//* tests/routes/AdminRoute.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";

import server from "../server";
import { API_BASE_URL } from "@/lib/constants";
import AdminRoute from "@/routes/AdminRoute";

const STALE_BY = 46 * 60 * 1000;

const makeClient = () =>
	new QueryClient({
		defaultOptions: { queries: { retry: false, gcTime: Infinity } },
	});

const cacheUser = (client: QueryClient, role: string) =>
	client.setQueryData(
		["currentUser"],
		{ success: true, message: "ok", data: { _id: "1", name: "Ada", role } },
		{ updatedAt: Date.now() - STALE_BY },
	);

const renderGuard = (client: QueryClient) =>
	render(
		<QueryClientProvider client={client}>
			<MemoryRouter initialEntries={["/admin/users"]}>
				<Routes>
					<Route element={<AdminRoute />}>
						<Route path="/admin/users" element={<p>Admin content</p>} />
					</Route>
					<Route path="/" element={<p>Sign in</p>} />
					<Route path="/my-files" element={<p>My files</p>} />
				</Routes>
			</MemoryRouter>
		</QueryClientProvider>,
	);

describe("AdminRoute", () => {
	it("keeps an admin in place when a background refetch fails", async () => {
		const client = makeClient();
		cacheUser(client, "admin");
		let hits = 0;
		server.use(
			http.get(`${API_BASE_URL}/auth/me`, () => {
				hits += 1;
				return HttpResponse.json(
					{ status: "error", error: { code: "INTERNAL", message: "boom" } },
					{ status: 500 },
				);
			}),
		);

		renderGuard(client);

		await waitFor(() => expect(hits).toBe(1));
		await waitFor(() =>
			expect(client.getQueryState(["currentUser"])?.status).toBe("error"),
		);

		expect(screen.getByText("Admin content")).toBeInTheDocument();
		expect(screen.queryByText("Sign in")).toBeNull();
	});

	it("sends a plain user to my files", async () => {
		const client = makeClient();
		cacheUser(client, "user");
		server.use(
			http.get(`${API_BASE_URL}/auth/me`, () =>
				HttpResponse.json({
					success: true,
					message: "ok",
					data: { _id: "1", name: "Ada", role: "user" },
				}),
			),
		);

		renderGuard(client);

		expect(await screen.findByText("My files")).toBeInTheDocument();
		expect(screen.queryByText("Admin content")).toBeNull();
	});
});
