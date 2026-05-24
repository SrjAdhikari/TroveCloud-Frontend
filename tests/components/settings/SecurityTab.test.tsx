//* tests/components/settings/SecurityTab.test.tsx

import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";

import { renderWithProviders } from "../../lib/render";
import SecurityTab from "@/components/settings/SecurityTab";

describe("SecurityTab", () => {
	it("keeps the change-password card", () => {
		renderWithProviders(<SecurityTab />);
		expect(screen.getByText("Change password")).toBeInTheDocument();
	});

	it("no longer renders the active-sessions card (moved to Sessions tab)", () => {
		renderWithProviders(<SecurityTab />);
		expect(screen.queryByText("Active sessions")).not.toBeInTheDocument();
	});
});
