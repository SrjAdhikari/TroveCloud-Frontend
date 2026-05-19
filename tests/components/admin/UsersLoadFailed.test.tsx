//* tests/components/admin/UsersLoadFailed.test.tsx

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UsersLoadFailed from "@/components/admin/UsersLoadFailed";

const noop = () => {};

describe("UsersLoadFailed", () => {
	it("maps INSUFFICIENT_ROLE to the access-denied copy", () => {
		render(
			<UsersLoadFailed
				error={{ code: "INSUFFICIENT_ROLE", message: "irrelevant" }}
				onRetry={noop}
			/>,
		);
		expect(screen.getByText("Access denied")).toBeInTheDocument();
		expect(
			screen.getByText(/don't have permissions/i),
		).toBeInTheDocument();
	});

	it("falls back to a generic connection message for unknown codes", () => {
		render(
			<UsersLoadFailed
				error={{ code: "SOME_UNKNOWN_CODE", message: "leaked backend text" }}
				onRetry={noop}
			/>,
		);
		expect(screen.getByText("Unable to load users")).toBeInTheDocument();
		expect(
			screen.getByText(/check your connection/i),
		).toBeInTheDocument();
		expect(screen.queryByText(/leaked backend text/i)).toBeNull();
	});

	it("uses role='alert' so screen readers announce the failure", () => {
		render(
			<UsersLoadFailed
				error={{ code: "INSUFFICIENT_ROLE", message: "" }}
				onRetry={noop}
			/>,
		);
		expect(screen.getByRole("alert")).toBeInTheDocument();
	});

	it("renders a Try again button that invokes onRetry on click", async () => {
		const onRetry = vi.fn();
		const user = userEvent.setup();
		render(
			<UsersLoadFailed
				error={{ code: "INTERNAL_ERROR", message: "" }}
				onRetry={onRetry}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /try again/i }));
		expect(onRetry).toHaveBeenCalledTimes(1);
	});
});
