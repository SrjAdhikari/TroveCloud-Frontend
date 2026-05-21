//* tests/components/admin/ConfirmActionDialog.test.tsx

import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ConfirmActionDialog from "@/components/admin/ConfirmActionDialog";

describe("ConfirmActionDialog", () => {
	it("renders the title, description, and confirm label", () => {
		render(
			<ConfirmActionDialog
				onClose={vi.fn()}
				title="Suspend user"
				description="They will lose access immediately."
				confirmLabel="Suspend"
				onConfirm={vi.fn().mockResolvedValue(undefined)}
				errorCopy={{}}
			/>,
		);

		expect(screen.getByText("Suspend user")).toBeInTheDocument();
		expect(
			screen.getByText("They will lose access immediately."),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Suspend" }),
		).toBeInTheDocument();
	});

	it("calls onConfirm and then onClose when the confirm action resolves", async () => {
		const user = userEvent.setup();
		const onConfirm = vi.fn().mockResolvedValue(undefined);
		const onClose = vi.fn();

		render(
			<ConfirmActionDialog
				onClose={onClose}
				title="Suspend user"
				description="They will lose access."
				confirmLabel="Suspend"
				onConfirm={onConfirm}
				errorCopy={{}}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Suspend" }));

		expect(onConfirm).toHaveBeenCalledTimes(1);
		await waitFor(() => {
			expect(onClose).toHaveBeenCalledTimes(1);
		});
	});

	it("disables both buttons while onConfirm is pending and shows a loading label", async () => {
		const user = userEvent.setup();
		let resolveOnConfirm: () => void = () => {};
		const onConfirm = vi.fn(
			() =>
				new Promise<void>((resolve) => {
					resolveOnConfirm = resolve;
				}),
		);

		render(
			<ConfirmActionDialog
				onClose={vi.fn()}
				title="Suspend user"
				description="They will lose access."
				confirmLabel="Suspend"
				onConfirm={onConfirm}
				errorCopy={{}}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Suspend" }));

		const confirmButton = screen.getByRole("button", { name: /working/i });
		expect(confirmButton).toBeDisabled();
		expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();

		resolveOnConfirm();
	});

	it("renders the mapped error copy when onConfirm rejects with a known code", async () => {
		const user = userEvent.setup();
		const onClose = vi.fn();
		const onConfirm = vi
			.fn()
			.mockRejectedValue({
				code: "CANNOT_ACT_ON_PEER",
				message: "leaked backend text",
			});

		render(
			<ConfirmActionDialog
				onClose={onClose}
				title="Suspend user"
				description="They will lose access."
				confirmLabel="Suspend"
				onConfirm={onConfirm}
				errorCopy={{
					CANNOT_ACT_ON_PEER:
						"You can't perform this action on a peer or higher.",
				}}
			/>,
		);

		const confirm = screen.getByRole("button", { name: "Suspend" });
		await user.click(confirm);

		await waitFor(() => {
			expect(
				screen.getByText(
					"You can't perform this action on a peer or higher.",
				),
			).toBeInTheDocument();
		});

		// Never displays error.message (project rule: no backend text in UI).
		expect(screen.queryByText(/leaked backend text/i)).toBeNull();

		// Dialog stays mounted on rejection — caller can read the banner and retry.
		expect(onClose).not.toHaveBeenCalled();
		expect(confirm).toBeEnabled();
	});

	it("falls back to a static generic message on an unmapped error code", async () => {
		const user = userEvent.setup();
		const onConfirm = vi
			.fn()
			.mockRejectedValue({ code: "UNEXPECTED_CODE", message: "raw backend" });

		render(
			<ConfirmActionDialog
				onClose={vi.fn()}
				title="Suspend user"
				description="They will lose access."
				confirmLabel="Suspend"
				onConfirm={onConfirm}
				errorCopy={{}}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Suspend" }));

		await waitFor(() => {
			expect(
				screen.getByText("Something went wrong. Please try again."),
			).toBeInTheDocument();
		});
		expect(screen.queryByText(/raw backend/i)).toBeNull();
	});

	it("disables the confirm button when confirmDisabled is true but leaves cancel enabled", () => {
		render(
			<ConfirmActionDialog
				onClose={vi.fn()}
				title="Change role"
				description="Pick a role."
				confirmLabel="Change role"
				onConfirm={vi.fn().mockResolvedValue(undefined)}
				errorCopy={{}}
				confirmDisabled
			/>,
		);

		expect(
			screen.getByRole("button", { name: "Change role" }),
		).toBeDisabled();
		expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
	});

	it("renders content passed through the children slot", () => {
		render(
			<ConfirmActionDialog
				onClose={vi.fn()}
				title="Change role"
				description="Pick a role."
				confirmLabel="Change role"
				onConfirm={vi.fn().mockResolvedValue(undefined)}
				errorCopy={{}}
			>
				<div data-testid="role-select-slot">role select</div>
			</ConfirmActionDialog>,
		);

		expect(screen.getByTestId("role-select-slot")).toBeInTheDocument();
	});

	it("calls onClose when the cancel button is clicked", async () => {
		const user = userEvent.setup();
		const onClose = vi.fn();

		render(
			<ConfirmActionDialog
				onClose={onClose}
				title="Suspend user"
				description="They will lose access."
				confirmLabel="Suspend"
				onConfirm={vi.fn().mockResolvedValue(undefined)}
				errorCopy={{}}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Cancel" }));

		expect(onClose).toHaveBeenCalledTimes(1);
	});
});
