//* tests/pages/ForgotPasswordPage.test.tsx

import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import { renderWithProviders } from "../lib/render";
import server from "../server";
import { API_BASE_URL } from "@/lib/constants";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";

vi.mock("@/lib/toast", () => ({
	default: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}));

/** Backend copy that must never reach the banner. */
const BACKEND_MESSAGE = "email: Invalid email address";

const errorResponse = (code: string, status: number) =>
	HttpResponse.json(
		{ status: "fail", error: { code, message: BACKEND_MESSAGE } },
		{ status },
	);

const submitEmail = async () => {
	const user = userEvent.setup();
	await user.type(
		screen.getByLabelText(/email address/i),
		"user@example.com",
	);
	await user.click(screen.getByRole("button", { name: /send reset code/i }));
};

describe("ForgotPasswordPage — backend error mapping", () => {
	beforeEach(() => {
		window.history.pushState({}, "", "/");
	});

	it("shows static copy for an unmapped code, never the backend message", async () => {
		server.use(
			http.post(`${API_BASE_URL}/auth/forgot-password`, () =>
				errorResponse("VALIDATION_ERROR", 400),
			),
		);

		renderWithProviders(<ForgotPasswordPage />);
		await submitEmail();

		expect(
			await screen.findByText("Something went wrong. Please try again."),
		).toBeInTheDocument();
		expect(screen.queryByText(BACKEND_MESSAGE)).not.toBeInTheDocument();
	});

	it("tells the user to wait when the endpoint rate-limits the request", async () => {
		server.use(
			http.post(`${API_BASE_URL}/auth/forgot-password`, () =>
				errorResponse("RATE_LIMITED", 429),
			),
		);

		renderWithProviders(<ForgotPasswordPage />);
		await submitEmail();

		const banner = await screen.findByText(
			"Too many attempts. Please wait a moment and try again.",
		);
		expect(banner.closest('[role="status"]')).toBeInTheDocument();
		expect(screen.queryByText(BACKEND_MESSAGE)).not.toBeInTheDocument();
	});
});
