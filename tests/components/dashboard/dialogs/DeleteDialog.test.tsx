//* tests/components/dashboard/dialogs/DeleteDialog.test.tsx

import { useState } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient } from "@tanstack/react-query";

import { renderWithProviders } from "../../../lib/render";
import DeleteDialog from "@/components/dashboard/dialogs/DeleteDialog";
import { deleteFile } from "@/api/file.api";
import { deleteDirectory } from "@/api/directory.api";

vi.mock("@/api/file.api");
vi.mock("@/api/directory.api");

vi.mock("@/lib/toast", () => ({
	default: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}));

beforeEach(() => {
	vi.clearAllMocks();
});

const Host = ({ type }: { type: "file" | "folder" }) => {
	const [open, setOpen] = useState(true);

	return open ? (
		<DeleteDialog
			onClose={() => setOpen(false)}
			itemId={type === "folder" ? "folder-1" : "file-1"}
			itemName={type === "folder" ? "Reports" : "report.pdf"}
			type={type}
		/>
	) : null;
};

const renderHost = (type: "file" | "folder") => {
	const client = new QueryClient();
	const invalidate = vi.spyOn(client, "invalidateQueries");
	renderWithProviders(<Host type={type} />, { client });
	return invalidate;
};

describe("DeleteDialog — file", () => {
	it("invalidates storageUsage as well as directory once the delete succeeds", async () => {
		vi.mocked(deleteFile).mockResolvedValue({
			success: true,
			message: "File deleted successfully",
			data: undefined,
		});

		const user = userEvent.setup();
		const invalidate = renderHost("file");

		await user.click(screen.getByRole("button", { name: "Delete" }));

		await waitFor(() =>
			expect(invalidate).toHaveBeenCalledWith({ queryKey: ["storageUsage"] }),
		);
		expect(invalidate).toHaveBeenCalledWith({ queryKey: ["directory"] });
	});

	it("keeps the dialog mounted until the delete settles, then closes it", async () => {
		let settle: (value: Awaited<ReturnType<typeof deleteFile>>) => void =
			() => {};
		vi.mocked(deleteFile).mockReturnValue(
			new Promise((resolve) => {
				settle = resolve;
			}),
		);

		const user = userEvent.setup();
		renderHost("file");

		await user.click(screen.getByRole("button", { name: "Delete" }));

		expect(screen.getByRole("alertdialog")).toBeInTheDocument();

		settle({
			success: true,
			message: "File deleted successfully",
			data: undefined,
		});

		await waitFor(() =>
			expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
		);
	});

	it("ignores Escape while the delete is in flight, then still invalidates", async () => {
		let settle: (value: Awaited<ReturnType<typeof deleteFile>>) => void =
			() => {};
		vi.mocked(deleteFile).mockReturnValue(
			new Promise((resolve) => {
				settle = resolve;
			}),
		);

		const user = userEvent.setup();
		const invalidate = renderHost("file");

		await user.click(screen.getByRole("button", { name: "Delete" }));
		await user.keyboard("{Escape}");

		expect(screen.getByRole("alertdialog")).toBeInTheDocument();

		settle({
			success: true,
			message: "File deleted successfully",
			data: undefined,
		});

		await waitFor(() =>
			expect(invalidate).toHaveBeenCalledWith({ queryKey: ["storageUsage"] }),
		);
	});
});

describe("DeleteDialog — folder", () => {
	it("invalidates storageUsage once the delete succeeds", async () => {
		vi.mocked(deleteDirectory).mockResolvedValue({
			success: true,
			message: "Folder deleted successfully",
			data: undefined,
		});

		const user = userEvent.setup();
		const invalidate = renderHost("folder");

		await user.click(screen.getByRole("button", { name: "Delete" }));

		await waitFor(() =>
			expect(invalidate).toHaveBeenCalledWith({ queryKey: ["storageUsage"] }),
		);
	});
});
