//* tests/components/admin/UserDetailLoadFailed.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import UserDetailLoadFailed from "@/components/admin/UserDetailLoadFailed";

describe("UserDetailLoadFailed", () => {
	it("maps INVALID_ID to the broken-link copy", () => {
		render(
			<UserDetailLoadFailed
				error={{ code: "INVALID_ID", message: "irrelevant" }}
			/>,
		);

		expect(screen.getByText("That user link looks broken")).toBeInTheDocument();
		expect(screen.getByText(/double-check the url/i)).toBeInTheDocument();
	});

	it("maps USER_NOT_FOUND to the not-found copy", () => {
		render(
			<UserDetailLoadFailed
				error={{ code: "USER_NOT_FOUND", message: "irrelevant" }}
			/>,
		);

		expect(screen.getByText("This user no longer exists")).toBeInTheDocument();
	});

	it("maps INSUFFICIENT_ROLE to the access-denied copy", () => {
		render(
			<UserDetailLoadFailed
				error={{ code: "INSUFFICIENT_ROLE", message: "irrelevant" }}
			/>,
		);

		expect(screen.getByText("Access denied")).toBeInTheDocument();
		expect(screen.getByText(/don't have permissions/i)).toBeInTheDocument();
	});

	it("falls back to a generic connection message for unknown codes", () => {
		render(
			<UserDetailLoadFailed
				error={{ code: "SOME_UNKNOWN_CODE", message: "leaked backend text" }}
			/>,
		);

		expect(screen.getByText("Unable to load this user")).toBeInTheDocument();
		expect(screen.getByText(/check your connection/i)).toBeInTheDocument();
		expect(screen.queryByText(/leaked backend text/i)).toBeNull();
	});

	it("uses role='alert' so screen readers announce the failure", () => {
		render(
			<UserDetailLoadFailed
				error={{ code: "INTERNAL_ERROR", message: "" }}
			/>,
		);

		expect(screen.getByRole("alert")).toBeInTheDocument();
	});

	it("does not render a Try again button — page is non-retryable", () => {
		render(
			<UserDetailLoadFailed
				error={{ code: "INTERNAL_ERROR", message: "" }}
			/>,
		);

		expect(screen.queryByRole("button", { name: /try again/i })).toBeNull();
	});
});
