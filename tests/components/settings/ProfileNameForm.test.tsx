//* tests/components/settings/ProfileNameForm.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { QueryClient } from "@tanstack/react-query";

import { renderWithProviders } from "../../lib/render";
import server from "../../server";
import { API_BASE_URL } from "@/lib/constants";
import ProfileNameForm from "@/components/settings/ProfileNameForm";

vi.mock("@/lib/toast", () => ({
	default: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}));

import toast from "@/lib/toast";

const userPayload = {
	_id: "1",
	name: "Ada Lovelace",
	email: "ada@example.com",
	role: "user",
	rootDirId: "root1",
	profilePicture: null,
	isVerified: true,
	createdAt: "2026-04-01T00:00:00.000Z",
	updatedAt: "2026-04-01T00:00:00.000Z",
};

beforeEach(() => {
	vi.clearAllMocks();
});

describe("ProfileNameForm", () => {
	it("prefills the input and hides Save until the name changes", () => {
		renderWithProviders(<ProfileNameForm currentName="Ada Lovelace" />);

		expect(screen.getByLabelText(/name/i)).toHaveValue("Ada Lovelace");
		expect(
			screen.queryByRole("button", { name: /save/i }),
		).not.toBeInTheDocument();
	});

	it("reveals Save once the name changes", async () => {
		const user = userEvent.setup();
		renderWithProviders(<ProfileNameForm currentName="Ada Lovelace" />);

		await user.type(screen.getByLabelText(/name/i), "!");

		expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
	});

	it("saves a changed valid name, updates the cache, and hides Save (no toast)", async () => {
		const user = userEvent.setup();
		const client = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});
		server.use(
			http.patch(`${API_BASE_URL}/users/profile`, async ({ request }) => {
				const body = (await request.json()) as { name: string };
				return HttpResponse.json({
					success: true,
					message: "Profile updated successfully",
					data: { ...userPayload, name: body.name },
				});
			}),
		);

		renderWithProviders(<ProfileNameForm currentName="Ada Lovelace" />, {
			client,
		});

		const input = screen.getByLabelText(/name/i);
		await user.clear(input);
		await user.type(input, "Ada B. Lovelace");

		const save = screen.getByRole("button", { name: /save/i });
		await waitFor(() => expect(save).toBeEnabled());
		await user.click(save);

		// The returned user lands in the cache so the sidebar avatar/name update.
		await waitFor(() =>
			expect(client.getQueryData(["currentUser"])).toMatchObject({
				data: { name: "Ada B. Lovelace" },
			}),
		);
		// Save hides again once the baseline resets — this vanishing IS the
		// success confirmation now that the toast is gone.
		await waitFor(() =>
			expect(
				screen.queryByRole("button", { name: /save/i }),
			).not.toBeInTheDocument(),
		);
		expect(toast.success).not.toHaveBeenCalled();
	});

	it("keeps Save disabled when the name is invalid (too short)", async () => {
		const user = userEvent.setup();
		renderWithProviders(<ProfileNameForm currentName="Ada Lovelace" />);

		const input = screen.getByLabelText(/name/i);
		await user.clear(input);
		await user.type(input, "Ad");

		expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
	});

	it("shows generic inline copy on a server/network failure (no toast)", async () => {
		const user = userEvent.setup();
		server.use(
			http.patch(`${API_BASE_URL}/users/profile`, () =>
				HttpResponse.json(
					{ status: "error", error: { code: "INTERNAL", message: "boom" } },
					{ status: 500 },
				),
			),
		);

		renderWithProviders(<ProfileNameForm currentName="Ada Lovelace" />);

		const input = screen.getByLabelText(/name/i);
		await user.clear(input);
		await user.type(input, "Ada B. Lovelace");
		await user.click(screen.getByRole("button", { name: /save/i }));

		await waitFor(() =>
			expect(
				screen.getByText("Couldn't update your name. Please try again."),
			).toBeInTheDocument(),
		);
		expect(toast.success).not.toHaveBeenCalled();
	});

	it("maps VALIDATION_ERROR to inline name copy", async () => {
		const user = userEvent.setup();
		server.use(
			http.patch(`${API_BASE_URL}/users/profile`, () =>
				HttpResponse.json(
					{
						status: "fail",
						error: { code: "VALIDATION_ERROR", message: "bad" },
					},
					{ status: 400 },
				),
			),
		);

		renderWithProviders(<ProfileNameForm currentName="Ada Lovelace" />);

		const input = screen.getByLabelText(/name/i);
		await user.clear(input);
		await user.type(input, "Ada B. Lovelace");
		await user.click(screen.getByRole("button", { name: /save/i }));

		await waitFor(() =>
			expect(
				screen.getByText("Name must be 3–50 characters."),
			).toBeInTheDocument(),
		);
	});
});
