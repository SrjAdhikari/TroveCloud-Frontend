//* tests/pages/LoginPage.test.tsx

import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import { renderWithProviders } from "../lib/render";
import server from "../server";
import { API_BASE_URL } from "@/lib/constants";
import LoginPage from "@/pages/LoginPage";

// GoogleLogin pulls in the gsi script + a provider context. Stub it out so
// the login form renders standalone in jsdom.
vi.mock("@react-oauth/google", () => ({
	GoogleLogin: () => null,
}));

vi.mock("@/lib/toast", () => ({
	default: {
		success: vi.fn(),
		error: vi.fn(),
		info: vi.fn(),
		warning: vi.fn(),
	},
}));

const errorResponse = (code: string, status: number) =>
	HttpResponse.json(
		{ status: "fail", error: { code, message: "rejected" } },
		{ status },
	);

const submitLogin = async () => {
	const user = userEvent.setup();
	await user.type(
		screen.getByLabelText(/email address/i),
		"user@example.com",
	);
	await user.type(screen.getByLabelText(/^password$/i), "anything");
	await user.click(screen.getByRole("button", { name: /sign in/i }));
};

describe("LoginPage — backend error mapping", () => {
	beforeEach(() => {
		// Public path so axiosClient's eviction interceptor doesn't redirect
		// the test window when 401/403 lands on the login flow.
		window.history.pushState({}, "", "/");
	});

	it("renders the suspended-account copy in an error banner when backend returns ACCOUNT_SUSPENDED", async () => {
		server.use(
			http.post(`${API_BASE_URL}/auth/login`, () =>
				errorResponse("ACCOUNT_SUSPENDED", 403),
			),
		);

		renderWithProviders(<LoginPage />);
		await submitLogin();

		const banner = await screen.findByRole("alert");
		expect(banner).toHaveTextContent(
			/this account has been suspended\. contact support/i,
		);
	});

	it("renders the deleted-account copy in an error banner when backend returns UNAUTHORIZED_ACCESS", async () => {
		server.use(
			http.post(`${API_BASE_URL}/auth/login`, () =>
				errorResponse("UNAUTHORIZED_ACCESS", 401),
			),
		);

		renderWithProviders(<LoginPage />);
		await submitLogin();

		const banner = await screen.findByRole("alert");
		expect(banner).toHaveTextContent(/this account is no longer available/i);
	});

	it("keeps the existing generic copy in an error banner for INVALID_CREDENTIALS", async () => {
		server.use(
			http.post(`${API_BASE_URL}/auth/login`, () =>
				errorResponse("INVALID_CREDENTIALS", 401),
			),
		);

		renderWithProviders(<LoginPage />);
		await submitLogin();

		const banner = await screen.findByRole("alert");
		expect(banner).toHaveTextContent(
			/invalid email or password\. please try again/i,
		);
	});

	it("renders the rate-limit copy in a warning banner when backend returns TOO_MANY_ATTEMPTS", async () => {
		server.use(
			http.post(`${API_BASE_URL}/auth/login`, () =>
				errorResponse("TOO_MANY_ATTEMPTS", 429),
			),
		);

		renderWithProviders(<LoginPage />);
		await submitLogin();

		const banner = await screen.findByRole("status");
		expect(banner).toHaveTextContent(
			/too many failed attempts\. please wait a few minutes/i,
		);
	});
});
