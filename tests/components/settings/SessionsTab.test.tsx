//* tests/components/settings/SessionsTab.test.tsx

import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "../../lib/render";
import SessionsTab from "@/components/settings/SessionsTab";

describe("SessionsTab", () => {
	it("renders the active-sessions placeholder and the all-devices logout card", () => {
		renderWithProviders(<SessionsTab />);

		expect(screen.getByText("Active sessions")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /log out of all devices/i }),
		).toBeInTheDocument();
	});

	it("opens the confirmation dialog when 'Log out of all devices' is clicked", async () => {
		const user = userEvent.setup();
		renderWithProviders(<SessionsTab />);

		await user.click(
			screen.getByRole("button", { name: /log out of all devices/i }),
		);

		expect(screen.getByText("Log out of all devices?")).toBeInTheDocument();
	});
});
