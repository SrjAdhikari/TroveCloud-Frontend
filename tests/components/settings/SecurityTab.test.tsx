//* tests/components/settings/SecurityTab.test.tsx

import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";

import { renderWithProviders } from "../../lib/render";
import server from "../../server";
import { API_BASE_URL } from "@/lib/constants";
import SecurityTab from "@/components/settings/SecurityTab";

const userPayload = {
	_id: "1",
	name: "Ada Lovelace",
	email: "ada@example.com",
	role: "user",
	rootDirId: "root1",
	profilePicture: null,
	provider: "email",
	isVerified: true,
	createdAt: "2026-04-01T00:00:00.000Z",
	updatedAt: "2026-04-01T00:00:00.000Z",
};

/** Serves GET /auth/me with the given sign-in provider. */
const mockCurrentUser = (provider: string) =>
	server.use(
		http.get(`${API_BASE_URL}/auth/me`, () =>
			HttpResponse.json({
				success: true,
				message: "ok",
				data: { ...userPayload, provider },
			}),
		),
	);

describe("SecurityTab", () => {
	it("keeps the change-password card", () => {
		renderWithProviders(<SecurityTab />);
		expect(screen.getByText("Change password")).toBeInTheDocument();
	});

	it("no longer renders the active-sessions card (moved to Sessions tab)", () => {
		renderWithProviders(<SecurityTab />);
		expect(screen.queryByText("Active sessions")).not.toBeInTheDocument();
	});

	it("renders a live change-password form for an email account", async () => {
		mockCurrentUser("email");
		renderWithProviders(<SecurityTab />);

		expect(await screen.findByLabelText("Current password")).toBeEnabled();
		expect(screen.getByLabelText("New password")).toBeEnabled();
		expect(screen.getByLabelText("Confirm new password")).toBeEnabled();
		expect(screen.queryByText("Coming soon")).not.toBeInTheDocument();
	});

	it("replaces the form with an explanation for a Google account", async () => {
		mockCurrentUser("google");
		renderWithProviders(<SecurityTab />);

		expect(
			await screen.findByText(/you signed in with Google/i),
		).toBeInTheDocument();
		expect(
			screen.queryByLabelText("Current password"),
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /update password/i }),
		).not.toBeInTheDocument();
	});

	it("names GitHub as the provider for a GitHub account", async () => {
		mockCurrentUser("github");
		renderWithProviders(<SecurityTab />);

		expect(
			await screen.findByText(/you signed in with GitHub/i),
		).toBeInTheDocument();
	});

	it("does not promise a password update in the card description for OAuth accounts", async () => {
		mockCurrentUser("google");
		renderWithProviders(<SecurityTab />);

		await screen.findByText(/you signed in with Google/i);
		expect(
			screen.queryByText("Update your password to keep your account secure."),
		).not.toBeInTheDocument();
	});
});
