//* tests/components/settings/LogoutAllDialog.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import { renderWithProviders } from "../../lib/render";
import server from "../../server";
import { API_BASE_URL } from "@/lib/constants";
import toast from "@/lib/toast";
import LogoutAllDialog from "@/components/settings/LogoutAllDialog";

vi.mock("@/lib/toast", () => ({
	default: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}));

beforeEach(() => {
	vi.clearAllMocks();
});

describe("LogoutAllDialog", () => {
	it("fires the all-devices logout and a success toast on confirm", async () => {
		const user = userEvent.setup();
		server.use(
			http.post(`${API_BASE_URL}/auth/logout-all`, () =>
				HttpResponse.json({ status: "success" }),
			),
		);

		renderWithProviders(<LogoutAllDialog onClose={vi.fn()} />);

		await user.click(
			screen.getByRole("button", { name: /^log out$/i }),
		);

		await waitFor(() =>
			expect(toast.success).toHaveBeenCalledWith(
				"Logged out of all devices successfully",
			),
		);
	});

	it("shows an error toast and stays open when logout-all fails", async () => {
		const user = userEvent.setup();
		server.use(
			http.post(`${API_BASE_URL}/auth/logout-all`, () =>
				HttpResponse.json({ status: "error" }, { status: 500 }),
			),
		);

		renderWithProviders(<LogoutAllDialog onClose={vi.fn()} />);

		await user.click(
			screen.getByRole("button", { name: /^log out$/i }),
		);

		await waitFor(() =>
			expect(toast.error).toHaveBeenCalledWith(
				"Couldn't log out of all devices. Please try again.",
			),
		);
		expect(screen.getByText("Log out of all devices?")).toBeInTheDocument();
	});

	it("calls onClose and fires no request when cancelled", async () => {
		const user = userEvent.setup();
		const onClose = vi.fn();
		const logoutAllSpy = vi.fn();
		server.use(
			http.post(`${API_BASE_URL}/auth/logout-all`, () => {
				logoutAllSpy();
				return HttpResponse.json({ status: "success" });
			}),
		);

		renderWithProviders(<LogoutAllDialog onClose={onClose} />);

		await user.click(screen.getByRole("button", { name: /cancel/i }));

		expect(onClose).toHaveBeenCalledTimes(1);
		expect(logoutAllSpy).not.toHaveBeenCalled();
	});
});
