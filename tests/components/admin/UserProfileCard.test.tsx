//* tests/components/admin/UserProfileCard.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import UserProfileCard from "@/components/admin/UserProfileCard";
import type { UserDetailPayload } from "@/types/admin.types";

const makeUserDetail = (
	overrides: Partial<UserDetailPayload> = {},
): UserDetailPayload => ({
	_id: "u1",
	name: "Ada Lovelace",
	email: "ada@example.com",
	profilePicture: null,
	role: "admin",
	rootDirId: "root-u1",
	isVerified: true,
	provider: "email",
	suspendedAt: null,
	suspendedBy: null,
	deletedAt: null,
	status: "active",
	createdAt: "2026-04-12T12:00:00Z",
	updatedAt: "2026-04-15T12:00:00Z",
	stats: {
		storageBytes: 0,
		fileCount: 0,
		directoryCount: 0,
		activeSessionCount: 0,
		lastLoginAt: null,
	},
	...overrides,
});

describe("UserProfileCard", () => {
	it("renders the Profile kicker label", () => {
		render(<UserProfileCard user={makeUserDetail()} />);

		expect(screen.getByText("Profile")).toBeInTheDocument();
	});

	it("renders Email / Provider / Verified / Joined / Last updated rows", () => {
		render(<UserProfileCard user={makeUserDetail()} />);

		expect(screen.getByText("Email")).toBeInTheDocument();
		expect(screen.getByText("ada@example.com")).toBeInTheDocument();

		expect(screen.getByText("Provider")).toBeInTheDocument();
		expect(screen.getByText("Verified")).toBeInTheDocument();

		expect(screen.getByText("Joined")).toBeInTheDocument();
		expect(screen.getByText("Last updated")).toBeInTheDocument();
	});

	it("renders the provider label with capitalize styling", () => {
		render(<UserProfileCard user={makeUserDetail({ provider: "google" })} />);

		// Raw text is lowercase; the `capitalize` class is what visually capitalizes it
		expect(screen.getByText("google")).toHaveClass("capitalize");
	});

	it("renders 'Yes' for verified users and 'No' for unverified", () => {
		const { rerender } = render(
			<UserProfileCard user={makeUserDetail({ isVerified: true })} />,
		);
		expect(screen.getByText("Yes")).toBeInTheDocument();

		rerender(<UserProfileCard user={makeUserDetail({ isVerified: false })} />);
		expect(screen.getByText("No")).toBeInTheDocument();
	});

	it("does not duplicate the role pill — that lives in the hero", () => {
		render(<UserProfileCard user={makeUserDetail()} />);

		expect(screen.queryByText("Role")).toBeNull();
		expect(screen.queryByText("Admin")).toBeNull();
	});

	it("falls back to initials when profilePicture is null", () => {
		render(<UserProfileCard user={makeUserDetail({ name: "Grace Hopper" })} />);

		expect(screen.getByText("GH")).toBeInTheDocument();
	});

	it("renders Joined and Updated as date-only (no time component)", () => {
		render(<UserProfileCard user={makeUserDetail()} />);

		// Fixture is noon UTC → resolves to the same calendar day in every real timezone
		expect(screen.getByText("Apr 12, 2026")).toBeInTheDocument();
		expect(screen.getByText("Apr 15, 2026")).toBeInTheDocument();
		// Guards against formatDate accidentally including a time component
		expect(screen.queryByText(/\d{1,2}:\d{2}/)).toBeNull();
	});
});
