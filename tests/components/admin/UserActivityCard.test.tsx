//* tests/components/admin/UserActivityCard.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import UserActivityCard from "@/components/admin/UserActivityCard";
import type { UserDetailPayload } from "@/types/admin.types";

const makeStats = (
	overrides: Partial<UserDetailPayload["stats"]> = {},
): UserDetailPayload["stats"] => ({
	storageBytes: 2_500_000_000,
	fileCount: 1247,
	directoryCount: 38,
	activeSessionCount: 2,
	lastLoginAt: "2026-05-19T12:00:00Z",
	...overrides,
});

describe("UserActivityCard", () => {
	it("renders the Activity kicker label", () => {
		render(<UserActivityCard stats={makeStats()} />);

		expect(screen.getByText("Activity")).toBeInTheDocument();
	});

	it("renders all five stat rows with formatted values", () => {
		render(<UserActivityCard stats={makeStats()} />);

		expect(screen.getByText("Storage used")).toBeInTheDocument();
		expect(screen.getByText("2.3 GB")).toBeInTheDocument();

		expect(screen.getByText("Files")).toBeInTheDocument();
		expect(screen.getByText("1,247")).toBeInTheDocument();

		expect(screen.getByText("Directories")).toBeInTheDocument();
		expect(screen.getByText("38")).toBeInTheDocument();

		expect(screen.getByText("Active sessions")).toBeInTheDocument();
		expect(screen.getByText("2")).toBeInTheDocument();

		expect(screen.getByText("Last login")).toBeInTheDocument();
	});

	it("renders 'No logins yet' when lastLoginAt is null", () => {
		render(<UserActivityCard stats={makeStats({ lastLoginAt: null })} />);

		expect(screen.getByText("No logins yet")).toBeInTheDocument();
	});
});
