//* tests/components/admin/HardDeleteDialog.test.tsx

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import HardDeleteDialog from "@/components/admin/HardDeleteDialog";

const TARGET_EMAIL = "victim@example.com";
const TARGET_NAME = "Victim User";

describe("HardDeleteDialog", () => {
	it("disables the confirm button until the typed email matches the target", async () => {
		const user = userEvent.setup();

		render(
			<HardDeleteDialog
				onClose={vi.fn()}
				userEmail={TARGET_EMAIL}
				userName={TARGET_NAME}
				onConfirm={vi.fn().mockResolvedValue(undefined)}
			/>,
		);

		const confirm = screen.getByRole("button", { name: "Delete" });
		expect(confirm).toBeDisabled();

		const input = screen.getByLabelText(/type the user's email/i);
		await user.type(input, TARGET_EMAIL);

		expect(confirm).toBeEnabled();
	});

	it("treats the match as case-insensitive and trims surrounding whitespace on the typed side", async () => {
		const user = userEvent.setup();

		render(
			<HardDeleteDialog
				onClose={vi.fn()}
				userEmail={TARGET_EMAIL}
				userName={TARGET_NAME}
				onConfirm={vi.fn().mockResolvedValue(undefined)}
			/>,
		);

		const confirm = screen.getByRole("button", { name: "Delete" });
		const input = screen.getByLabelText(/type the user's email/i);

		await user.type(input, "  VICTIM@Example.COM  ");

		expect(confirm).toBeEnabled();
	});

	it("also normalizes the userEmail prop so a mixed-case or padded backend value still matches", async () => {
		const user = userEvent.setup();

		render(
			<HardDeleteDialog
				onClose={vi.fn()}
				userEmail="  Victim@Example.com  "
				userName={TARGET_NAME}
				onConfirm={vi.fn().mockResolvedValue(undefined)}
			/>,
		);

		const confirm = screen.getByRole("button", { name: "Delete" });
		const input = screen.getByLabelText(/type the user's email/i);

		await user.type(input, TARGET_EMAIL);

		expect(confirm).toBeEnabled();
	});

	it("re-disables the confirm button when the user clears or mistypes the email", async () => {
		const user = userEvent.setup();

		render(
			<HardDeleteDialog
				onClose={vi.fn()}
				userEmail={TARGET_EMAIL}
				userName={TARGET_NAME}
				onConfirm={vi.fn().mockResolvedValue(undefined)}
			/>,
		);

		const confirm = screen.getByRole("button", { name: "Delete" });
		const input = screen.getByLabelText(/type the user's email/i);

		await user.type(input, TARGET_EMAIL);
		expect(confirm).toBeEnabled();

		await user.clear(input);
		expect(confirm).toBeDisabled();

		await user.type(input, "wrong@example.com");
		expect(confirm).toBeDisabled();
	});

	it("fires onConfirm when the confirm button is clicked after a match", async () => {
		const user = userEvent.setup();
		const onConfirm = vi.fn().mockResolvedValue(undefined);

		render(
			<HardDeleteDialog
				onClose={vi.fn()}
				userEmail={TARGET_EMAIL}
				userName={TARGET_NAME}
				onConfirm={onConfirm}
			/>,
		);

		const input = screen.getByLabelText(/type the user's email/i);
		await user.type(input, TARGET_EMAIL);

		await user.click(
			screen.getByRole("button", { name: "Delete" }),
		);

		expect(onConfirm).toHaveBeenCalledTimes(1);
	});

	it("renders the user's name in the dialog description", () => {
		render(
			<HardDeleteDialog
				onClose={vi.fn()}
				userEmail={TARGET_EMAIL}
				userName={TARGET_NAME}
				onConfirm={vi.fn().mockResolvedValue(undefined)}
			/>,
		);

		expect(screen.getByText(new RegExp(TARGET_NAME))).toBeInTheDocument();
	});
});
