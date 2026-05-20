//* tests/config/axiosClient.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { http, HttpResponse } from "msw";

import axiosClient from "@/config/axiosClient";
import queryClient from "@/config/queryClient";
import { API_BASE_URL } from "@/lib/constants";
import ROUTES from "@/routes/paths";
import server from "../server";

/**
 * `invalidateQueries` is the proxy for "the eviction branch fired" — it sits
 * one line above the `window.location.href` redirect inside the same `if`
 * block, so its call count cleanly tells us whether the gate (eviction code
 * + non-public path) was satisfied. We don't unit-test the redirect target
 * because jsdom locks all `window.location` writes as non-configurable;
 * coverage tooling catches the redirect line itself.
 */

const errorResponse = (code: string, status: number) =>
	HttpResponse.json(
		{ status: "fail", error: { code, message: "blocked" } },
		{ status },
	);

describe("axiosClient response interceptor — eviction codes", () => {
	let invalidateSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		// Default to a guarded (non-public) path so the eviction branch fires.
		window.history.pushState({}, "", "/admin/users");
		invalidateSpy = vi
			.spyOn(queryClient, "invalidateQueries")
			.mockResolvedValue(undefined);
	});

	afterEach(() => {
		invalidateSpy.mockRestore();
	});

	it.each([
		["INSUFFICIENT_ROLE", 403],
		["ACCOUNT_SUSPENDED", 403],
		["UNAUTHORIZED_ACCESS", 401],
	] as const)(
		"invalidates currentUser on %s (eviction code on a guarded path)",
		async (code, status) => {
			server.use(
				http.get(`${API_BASE_URL}/probe`, () => errorResponse(code, status)),
			);

			await expect(axiosClient.get("/probe")).rejects.toMatchObject({ code });

			expect(invalidateSpy).toHaveBeenCalledWith({
				queryKey: ["currentUser"],
			});
		},
	);

	it("does NOT invalidate when the user is already on a public path", async () => {
		window.history.pushState({}, "", ROUTES.ROOT);
		server.use(
			http.get(`${API_BASE_URL}/probe`, () =>
				errorResponse("UNAUTHORIZED_ACCESS", 401),
			),
		);

		await expect(axiosClient.get("/probe")).rejects.toMatchObject({
			code: "UNAUTHORIZED_ACCESS",
		});

		expect(invalidateSpy).not.toHaveBeenCalled();
	});

	it("passes non-eviction errors through without invalidating", async () => {
		server.use(
			http.get(`${API_BASE_URL}/probe`, () =>
				errorResponse("USER_NOT_FOUND", 404),
			),
		);

		await expect(axiosClient.get("/probe")).rejects.toMatchObject({
			code: "USER_NOT_FOUND",
		});

		expect(invalidateSpy).not.toHaveBeenCalled();
	});
});
