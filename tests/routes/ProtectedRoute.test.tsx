//* tests/routes/ProtectedRoute.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";

import server from "../server";
import { API_BASE_URL } from "@/lib/constants";
import ProtectedRoute from "@/routes/ProtectedRoute";

const STALE_BY = 46 * 60 * 1000;

const cachedUser = {
	success: true,
	message: "ok",
	data: { _id: "1", name: "Ada Lovelace", role: "user" },
};

const makeClient = () =>
	new QueryClient({
		defaultOptions: { queries: { retry: false, gcTime: Infinity } },
	});

const renderGuard = (client: QueryClient) =>
	render(
		<QueryClientProvider client={client}>
			<MemoryRouter initialEntries={["/my-files"]}>
				<Routes>
					<Route element={<ProtectedRoute />}>
						<Route path="/my-files" element={<p>Protected content</p>} />
					</Route>
					<Route path="/" element={<p>Sign in</p>} />
				</Routes>
			</MemoryRouter>
		</QueryClientProvider>,
	);

describe("ProtectedRoute", () => {
	it("keeps a signed-in user in place when a background refetch fails", async () => {
		const client = makeClient();
		// Cached as stale so mounting triggers the background refetch that fails.
		client.setQueryData(["currentUser"], cachedUser, {
			updatedAt: Date.now() - STALE_BY,
		});
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

		// The guard renders on cached data first; the redirect regression only
		// appears once the background refetch has actually rejected.
		await waitFor(() => expect(hits).toBe(1));
		await waitFor(() =>
			expect(client.getQueryState(["currentUser"])?.status).toBe("error"),
		);

		expect(screen.getByText("Protected content")).toBeInTheDocument();
		expect(screen.queryByText("Sign in")).toBeNull();
	});

	it("redirects to sign in when there is no cached user and the request fails", async () => {
		server.use(
			http.get(`${API_BASE_URL}/auth/me`, () =>
				HttpResponse.json(
					{
						status: "fail",
						error: { code: "UNAUTHORIZED_ACCESS", message: "nope" },
					},
					{ status: 401 },
				),
			),
		);

		renderGuard(makeClient());

		expect(await screen.findByText("Sign in")).toBeInTheDocument();
		expect(screen.queryByText("Protected content")).toBeNull();
	});
});
