//* tests/components/admin/UsersLoadFailed.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import UsersLoadFailed from "@/components/admin/UsersLoadFailed";

describe("UsersLoadFailed", () => {
	it("maps INSUFFICIENT_ROLE to the access-denied copy", () => {
		render(
			<UsersLoadFailed
				error={{ code: "INSUFFICIENT_ROLE", message: "irrelevant" }}
			/>,
		);
		expect(screen.getByText("Access denied")).toBeInTheDocument();
		expect(screen.getByText(/don't have permissions/i)).toBeInTheDocument();
	});

	it("falls back to a generic connection message for unknown codes", () => {
		render(
			<UsersLoadFailed
				error={{ code: "SOME_UNKNOWN_CODE", message: "leaked backend text" }}
			/>,
		);
		expect(screen.getByText("Unable to load users")).toBeInTheDocument();
		expect(screen.getByText(/check your connection/i)).toBeInTheDocument();
		expect(screen.queryByText(/leaked backend text/i)).toBeNull();
	});
});
