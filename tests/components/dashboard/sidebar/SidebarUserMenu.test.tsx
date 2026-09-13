//* tests/components/dashboard/sidebar/SidebarUserMenu.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import { renderWithProviders } from "../../../lib/render";
import server from "../../../server";
import { API_BASE_URL } from "@/lib/constants";
import toast from "@/lib/toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import SidebarUserMenu from "@/components/dashboard/sidebar/SidebarUserMenu";

vi.mock("@/lib/toast", () => ({
	default: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}));

beforeEach(() => {
	vi.clearAllMocks();
	server.use(
		http.get(`${API_BASE_URL}/auth/me`, () =>
			HttpResponse.json({
				status: "success",
				data: {
					_id: "1",
					name: "Ada Lovelace",
					email: "ada@example.com",
					role: "user",
				},
			}),
		),
	);
	server.use(
		http.get(`${API_BASE_URL}/storage/usage`, () =>
			HttpResponse.json({
				success: true,
				data: { used: 575703552, total: 1000000000, breakdown: [] },
			}),
		),
	);
});

const openMenu = async (user: ReturnType<typeof userEvent.setup>) => {
	await user.click(await screen.findByRole("button", { name: /ada lovelace/i }));
};

describe("SidebarUserMenu logout", () => {
	it("logs out the current session instantly without a confirmation dialog", async () => {
		const user = userEvent.setup();
		server.use(
			http.post(`${API_BASE_URL}/auth/logout`, () =>
				HttpResponse.json({ status: "success" }),
			),
		);

		renderWithProviders(
			<SidebarProvider>
				<SidebarUserMenu />
			</SidebarProvider>,
		);

		await openMenu(user);
		await user.click(screen.getByRole("menuitem", { name: /log out/i }));

		await waitFor(() =>
			expect(toast.success).toHaveBeenCalledWith("Logged out successfully"),
		);
		expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
	});

	it("shows an error toast when logout fails", async () => {
		const user = userEvent.setup();
		server.use(
			http.post(`${API_BASE_URL}/auth/logout`, () =>
				HttpResponse.json({ status: "error" }, { status: 500 }),
			),
		);

		renderWithProviders(
			<SidebarProvider>
				<SidebarUserMenu />
			</SidebarProvider>,
		);

		await openMenu(user);
		await user.click(screen.getByRole("menuitem", { name: /log out/i }));

		await waitFor(() =>
			expect(toast.error).toHaveBeenCalledWith(
				"Couldn't log out. Please try again.",
			),
		);
	});
});

describe("SidebarUserMenu storage", () => {
	it("shows the user's storage usage from the API", async () => {
		const user = userEvent.setup();

		renderWithProviders(
			<SidebarProvider>
				<SidebarUserMenu />
			</SidebarProvider>,
		);

		await openMenu(user);

		expect(await screen.findByText("575.7 MB / 1 GB")).toBeInTheDocument();
	});
});
