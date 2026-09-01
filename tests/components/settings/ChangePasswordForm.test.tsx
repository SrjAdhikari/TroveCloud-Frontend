//* tests/components/settings/ChangePasswordForm.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import { renderWithProviders } from "../../lib/render";
import server from "../../server";
import { API_BASE_URL } from "@/lib/constants";
import ChangePasswordForm from "@/components/settings/ChangePasswordForm";

vi.mock("@/lib/toast", () => ({
	default: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}));

import toast from "@/lib/toast";

/** Fills all three fields with a valid combination and submits. */
const submitValidChange = async (user: ReturnType<typeof userEvent.setup>) => {
	await user.type(screen.getByLabelText("Current password"), "OldPass123!");
	await user.type(screen.getByLabelText("New password"), "NewPass456!");
	await user.type(screen.getByLabelText("Confirm new password"), "NewPass456!");
	await user.click(screen.getByRole("button", { name: /update password/i }));
};

beforeEach(() => {
	vi.clearAllMocks();
});

describe("ChangePasswordForm", () => {
	it("sends only the current and new password to the change-password endpoint", async () => {
		const user = userEvent.setup();
		let received: unknown;
		server.use(
			http.patch(`${API_BASE_URL}/auth/change-password`, async ({ request }) => {
				received = await request.json();
				return HttpResponse.json({
					success: true,
					message: "Password changed successfully",
				});
			}),
		);

		renderWithProviders(<ChangePasswordForm />);
		await submitValidChange(user);

		await waitFor(() =>
			expect(received).toEqual({
				currentPassword: "OldPass123!",
				newPassword: "NewPass456!",
			}),
		);
	});

	it("clears the fields and toasts on success", async () => {
		const user = userEvent.setup();
		server.use(
			http.patch(`${API_BASE_URL}/auth/change-password`, () =>
				HttpResponse.json({
					success: true,
					message: "Password changed successfully",
				}),
			),
		);

		renderWithProviders(<ChangePasswordForm />);
		await submitValidChange(user);

		await waitFor(() =>
			expect(screen.getByLabelText("Current password")).toHaveValue(""),
		);
		expect(screen.getByLabelText("New password")).toHaveValue("");
		expect(screen.getByLabelText("Confirm new password")).toHaveValue("");
		expect(toast.success).toHaveBeenCalledTimes(1);
	});

	it("maps INVALID_CREDENTIALS to an inline error on the current-password field", async () => {
		const user = userEvent.setup();
		server.use(
			http.patch(`${API_BASE_URL}/auth/change-password`, () =>
				HttpResponse.json(
					{
						status: "fail",
						error: {
							code: "INVALID_CREDENTIALS",
							message: "backend copy that must not reach the UI",
						},
					},
					{ status: 401 },
				),
			),
		);

		renderWithProviders(<ChangePasswordForm />);
		await submitValidChange(user);

		await waitFor(() =>
			expect(
				screen.getByText("Current password is incorrect."),
			).toBeInTheDocument(),
		);
		expect(
			screen.queryByText("backend copy that must not reach the UI"),
		).not.toBeInTheDocument();
		expect(toast.success).not.toHaveBeenCalled();
		expect(toast.error).not.toHaveBeenCalled();
	});

	it("shows static generic copy on an unmapped failure, never the backend message", async () => {
		const user = userEvent.setup();
		server.use(
			http.patch(`${API_BASE_URL}/auth/change-password`, () =>
				HttpResponse.json(
					{
						status: "error",
						error: { code: "INTERNAL", message: "stack trace leak" },
					},
					{ status: 500 },
				),
			),
		);

		renderWithProviders(<ChangePasswordForm />);
		await submitValidChange(user);

		await waitFor(() =>
			expect(
				screen.getByText("Couldn't change your password. Please try again."),
			).toBeInTheDocument(),
		);
		expect(screen.queryByText("stack trace leak")).not.toBeInTheDocument();
		expect(toast.success).not.toHaveBeenCalled();
	});

	it("maps RATE_LIMITED to a warning banner", async () => {
		const user = userEvent.setup();
		server.use(
			http.patch(`${API_BASE_URL}/auth/change-password`, () =>
				HttpResponse.json(
					{
						status: "fail",
						error: { code: "RATE_LIMITED", message: "Too many requests" },
					},
					{ status: 429 },
				),
			),
		);

		renderWithProviders(<ChangePasswordForm />);
		await submitValidChange(user);

		const banner = await screen.findByText(
			"Too many attempts. Please wait a moment and try again.",
		);
		expect(banner.closest('[role="status"]')).toBeInTheDocument();
	});
});
