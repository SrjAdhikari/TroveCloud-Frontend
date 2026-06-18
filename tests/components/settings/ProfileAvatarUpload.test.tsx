//* tests/components/settings/ProfileAvatarUpload.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { QueryClient } from "@tanstack/react-query";

import { renderWithProviders } from "../../lib/render";
import server from "../../server";
import { API_BASE_URL, MAX_PROFILE_PICTURE_BYTES } from "@/lib/constants";
import ProfileAvatarUpload from "@/components/settings/ProfileAvatarUpload";
import type { UserPayload } from "@/types/auth.types";

vi.mock("@/lib/toast", () => ({
	default: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}));

import toast from "@/lib/toast";

const user: UserPayload = {
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

describe("ProfileAvatarUpload", () => {
	it("uploads a valid image and updates the cache (no toast)", async () => {
		const ue = userEvent.setup();
		const client = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});
		server.use(
			http.post(`${API_BASE_URL}/users/profile-picture`, () =>
				HttpResponse.json({
					success: true,
					message: "Profile picture updated successfully",
					data: { ...user, profilePicture: "https://cdn/x.png" },
				}),
			),
		);

		renderWithProviders(<ProfileAvatarUpload user={user} />, { client });

		const file = new File([new Uint8Array(10)], "avatar.png", {
			type: "image/png",
		});
		await ue.upload(screen.getByLabelText(/upload profile picture/i), file);

		// The returned user lands in the cache so the avatar/sidebar swap — this
		// visual change IS the success confirmation now that the toast is gone.
		await waitFor(() =>
			expect(client.getQueryData(["currentUser"])).toMatchObject({
				data: { profilePicture: "https://cdn/x.png" },
			}),
		);
		expect(toast.success).not.toHaveBeenCalled();
	});

	it("rejects a non-image file inline without a request", async () => {
		// applyAccept: false so userEvent doesn't pre-filter the gif by the input's
		// accept attr — this exercises the component's own type guard, which is the
		// real gate (a user can bypass the native picker's accept hint).
		const ue = userEvent.setup({ applyAccept: false });
		const requestSpy = vi.fn();
		server.use(
			http.post(`${API_BASE_URL}/users/profile-picture`, () => {
				requestSpy();
				return HttpResponse.json({ success: true, message: "", data: user });
			}),
		);

		renderWithProviders(<ProfileAvatarUpload user={user} />);

		const file = new File([new Uint8Array(10)], "anim.gif", {
			type: "image/gif",
		});
		await ue.upload(screen.getByLabelText(/upload profile picture/i), file);

		expect(
			await screen.findByText("Please choose a JPEG, PNG, or WEBP image."),
		).toBeInTheDocument();
		expect(requestSpy).not.toHaveBeenCalled();
		expect(toast.success).not.toHaveBeenCalled();
	});

	it("rejects an oversized image inline without a request", async () => {
		const ue = userEvent.setup();
		renderWithProviders(<ProfileAvatarUpload user={user} />);

		const file = new File(
			[new Uint8Array(MAX_PROFILE_PICTURE_BYTES + 1)],
			"big.png",
			{ type: "image/png" },
		);
		await ue.upload(screen.getByLabelText(/upload profile picture/i), file);

		expect(
			await screen.findByText(
				"Image is too large. Please choose one under 2 MB.",
			),
		).toBeInTheDocument();
	});

	it("maps a server INVALID_IMAGE_TYPE to inline copy, no toast", async () => {
		const ue = userEvent.setup();
		server.use(
			http.post(`${API_BASE_URL}/users/profile-picture`, () =>
				HttpResponse.json(
					{
						status: "fail",
						error: { code: "INVALID_IMAGE_TYPE", message: "bad bytes" },
					},
					{ status: 400 },
				),
			),
		);

		renderWithProviders(<ProfileAvatarUpload user={user} />);

		const file = new File([new Uint8Array(10)], "avatar.png", {
			type: "image/png",
		});
		await ue.upload(screen.getByLabelText(/upload profile picture/i), file);

		expect(
			await screen.findByText("Please choose a JPEG, PNG, or WEBP image."),
		).toBeInTheDocument();
		expect(toast.error).not.toHaveBeenCalled();
	});

	it("shows generic inline copy + a toast on a 500", async () => {
		const ue = userEvent.setup();
		server.use(
			http.post(`${API_BASE_URL}/users/profile-picture`, () =>
				HttpResponse.json(
					{ status: "error", error: { code: "INTERNAL", message: "boom" } },
					{ status: 500 },
				),
			),
		);

		renderWithProviders(<ProfileAvatarUpload user={user} />);

		const file = new File([new Uint8Array(10)], "avatar.png", {
			type: "image/png",
		});
		await ue.upload(screen.getByLabelText(/upload profile picture/i), file);

		expect(
			await screen.findByText("Couldn't upload your photo. Please try again."),
		).toBeInTheDocument();
		await waitFor(() =>
			expect(toast.error).toHaveBeenCalledWith(
				"Couldn't upload your photo. Please try again.",
			),
		);
	});
});
