//* tests/components/dashboard/dialogs/FileUploadDialog.test.tsx

import { describe, it, expect, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "../../../lib/render";
import FileUploadDialog from "@/components/dashboard/dialogs/FileUploadDialog";

const mockUsage = vi.fn();

vi.mock("@/hooks/useStorageUsage", () => ({
	default: () => mockUsage(),
}));

const usageResponse = (used: number, total: number) => ({
	data: { success: true, message: "ok", data: { used, total, breakdown: [] } },
});

const makeFile = (name: string, size: number) => {
	const file = new File(["x"], name, { type: "application/pdf" });
	Object.defineProperty(file, "size", { value: size });
	return file;
};

const selectFile = async (file: File) => {
	await userEvent.upload(screen.getByLabelText("Select files to upload"), file);
};

const uploadButton = () => screen.getByRole("button", { name: /upload/i });

describe("FileUploadDialog storage guard", () => {
	it("blocks a selection larger than the remaining quota", async () => {
		mockUsage.mockReturnValue(usageResponse(900, 1000));
		renderWithProviders(<FileUploadDialog onClose={vi.fn()} onUpload={vi.fn()} />);

		await selectFile(makeFile("big.pdf", 200));

		expect(
			within(screen.getByRole("alert")).getByText(/not enough storage/i),
		).toBeInTheDocument();
		expect(uploadButton()).toHaveAttribute("aria-disabled", "true");
	});

	it("keeps the blocked Upload button focusable and describes why", async () => {
		mockUsage.mockReturnValue(usageResponse(900, 1000));
		renderWithProviders(<FileUploadDialog onClose={vi.fn()} onUpload={vi.fn()} />);

		await selectFile(makeFile("big.pdf", 200));

		expect(uploadButton()).not.toBeDisabled();
		expect(uploadButton()).toHaveAccessibleDescription(/not enough storage/i);
	});

	it("allows a selection that exactly fills the quota", async () => {
		mockUsage.mockReturnValue(usageResponse(900, 1000));
		renderWithProviders(<FileUploadDialog onClose={vi.fn()} onUpload={vi.fn()} />);

		await selectFile(makeFile("exact.pdf", 100));

		expect(screen.queryByRole("alert")).not.toBeInTheDocument();
		expect(uploadButton()).not.toHaveAttribute("aria-disabled", "true");
	});

	it("fails open while usage is still loading", async () => {
		mockUsage.mockReturnValue({ data: undefined });
		renderWithProviders(<FileUploadDialog onClose={vi.fn()} onUpload={vi.fn()} />);

		await selectFile(makeFile("big.pdf", 999_999));

		expect(screen.queryByRole("alert")).not.toBeInTheDocument();
		expect(uploadButton()).not.toHaveAttribute("aria-disabled", "true");
	});

	it("does not call onUpload when a blocked Upload button is clicked", async () => {
		const onUpload = vi.fn();
		mockUsage.mockReturnValue(usageResponse(900, 1000));
		renderWithProviders(<FileUploadDialog onClose={vi.fn()} onUpload={onUpload} />);

		await selectFile(makeFile("big.pdf", 200));
		await userEvent.click(uploadButton());

		expect(onUpload).not.toHaveBeenCalled();
	});
});
