//* tests/components/admin/UsersToolbar.test.tsx

import type { ReactElement } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TooltipProvider } from "@/components/ui/tooltip";
import UsersToolbar from "@/components/admin/UsersToolbar";

const renderWithTooltip = (ui: ReactElement) =>
	render(<TooltipProvider>{ui}</TooltipProvider>);

const baseProps = {
	localQuery: "",
	onLocalQueryChange: vi.fn(),
	role: undefined,
	status: undefined,
	includeDeleted: false,
	onRoleChange: vi.fn(),
	onStatusChange: vi.fn(),
	onIncludeDeletedChange: vi.fn(),
};

describe("UsersToolbar", () => {
	it("fires onLocalQueryChange on every keystroke", async () => {
		const user = userEvent.setup();
		const onLocalQueryChange = vi.fn();
		renderWithTooltip(
			<UsersToolbar {...baseProps} onLocalQueryChange={onLocalQueryChange} />,
		);

		await user.type(screen.getByPlaceholderText(/search by name/i), "abc");

		// Component is controlled (`value={localQuery}` stays "") so each keystroke
		// fires onChange with the single new char rather than the accumulated string.
		// Asserts the contract: callback fires once per keystroke with what the user typed.
		expect(onLocalQueryChange).toHaveBeenCalledTimes(3);
		expect(onLocalQueryChange).toHaveBeenNthCalledWith(1, "a");
		expect(onLocalQueryChange).toHaveBeenNthCalledWith(2, "b");
		expect(onLocalQueryChange).toHaveBeenNthCalledWith(3, "c");
	});

	it("clears local query when the X button is clicked", async () => {
		const user = userEvent.setup();
		const onLocalQueryChange = vi.fn();
		renderWithTooltip(
			<UsersToolbar
				{...baseProps}
				localQuery="abc"
				onLocalQueryChange={onLocalQueryChange}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /clear search/i }));
		expect(onLocalQueryChange).toHaveBeenCalledWith("");
	});

	it("disables the include-deleted switch when any status filter is set", () => {
		renderWithTooltip(<UsersToolbar {...baseProps} status="active" />);
		expect(
			screen.getByRole("switch", { name: /include deleted/i }),
		).toBeDisabled();
	});

	it("enables the include-deleted switch when no status filter is set", () => {
		renderWithTooltip(<UsersToolbar {...baseProps} status={undefined} />);
		expect(
			screen.getByRole("switch", { name: /include deleted/i }),
		).toBeEnabled();
	});

	it("fires onIncludeDeletedChange with true when toggled on", async () => {
		const user = userEvent.setup();
		const onIncludeDeletedChange = vi.fn();
		renderWithTooltip(
			<UsersToolbar
				{...baseProps}
				onIncludeDeletedChange={onIncludeDeletedChange}
			/>,
		);

		await user.click(
			screen.getByRole("switch", { name: /include deleted/i }),
		);
		expect(onIncludeDeletedChange).toHaveBeenCalledWith(true);
	});
});
