//* tests/components/dashboard/upload/FileUploadProgress.test.tsx

import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithRouter } from "../../../lib/render";
import FileUploadProgress from "@/components/dashboard/upload/FileUploadProgress";
import type { UploadItem } from "@/hooks/useFileUpload";

const makeUpload = (overrides: Partial<UploadItem> = {}): UploadItem => ({
	id: "u1",
	fileName: "report.pdf",
	progress: 0,
	status: "reserving",
	...overrides,
});

describe("FileUploadProgress — status line", () => {
	it("labels a reserving row and shows no percentage readout", () => {
		renderWithRouter(
			<FileUploadProgress
				uploads={[makeUpload({ status: "reserving" })]}
				onDismiss={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);

		expect(screen.getByText(/preparing upload/i)).toBeInTheDocument();
		expect(screen.queryByText(/%$/)).toBeNull();
	});

	it("labels a confirming row and shows no live percentage", () => {
		renderWithRouter(
			<FileUploadProgress
				uploads={[makeUpload({ status: "confirming", progress: 100 })]}
				onDismiss={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);

		expect(screen.getByText(/finishing up/i)).toBeInTheDocument();
		expect(screen.queryByText(/%$/)).toBeNull();
	});

	it("labels a finished row as completed", () => {
		renderWithRouter(
			<FileUploadProgress
				uploads={[makeUpload({ status: "success", progress: 100 })]}
				onDismiss={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);

		expect(screen.getByText("Completed")).toBeInTheDocument();
	});

	it("shows the mapped error message on a failed row", () => {
		renderWithRouter(
			<FileUploadProgress
				uploads={[
					makeUpload({
						status: "error",
						errorMessage: "Not enough storage space",
					}),
				]}
				onDismiss={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);

		expect(screen.getByText("Not enough storage space")).toBeInTheDocument();
	});
});

describe("FileUploadProgress — progress affordance", () => {
	it("spins an indicator instead of a bar while reserving", () => {
		const { container } = renderWithRouter(
			<FileUploadProgress
				uploads={[makeUpload({ status: "reserving" })]}
				onDismiss={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);

		expect(container.querySelector(".animate-spin")).toBeInTheDocument();
		expect(screen.queryByRole("progressbar")).toBeNull();
	});

	it("spins an indicator instead of a bar while confirming", () => {
		const { container } = renderWithRouter(
			<FileUploadProgress
				uploads={[makeUpload({ status: "confirming", progress: 100 })]}
				onDismiss={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);

		expect(container.querySelector(".animate-spin")).toBeInTheDocument();
		expect(screen.queryByRole("progressbar")).toBeNull();
	});

	it("shows the live percentage while uploading", () => {
		renderWithRouter(
			<FileUploadProgress
				uploads={[makeUpload({ status: "uploading", progress: 42 })]}
				onDismiss={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);

		expect(screen.getByText("42%")).toBeInTheDocument();
		expect(screen.getByRole("progressbar")).toBeInTheDocument();
	});
});

describe("FileUploadProgress — close button", () => {
	const inFlight: UploadItem["status"][] = [
		"reserving",
		"uploading",
		"confirming",
	];

	it.each(inFlight)("cancels an in-flight %s upload", async (status) => {
		const user = userEvent.setup();
		const onCancel = vi.fn();
		const onDismiss = vi.fn();

		renderWithRouter(
			<FileUploadProgress
				uploads={[makeUpload({ status })]}
				onDismiss={onDismiss}
				onCancel={onCancel}
			/>,
		);

		await user.click(screen.getByRole("button"));

		expect(onCancel).toHaveBeenCalledWith("u1");
		expect(onDismiss).not.toHaveBeenCalled();
	});

	const terminal: UploadItem["status"][] = ["success", "error"];

	it.each(terminal)(
		"dismisses a terminal %s upload",
		async (status) => {
			const user = userEvent.setup();
			const onCancel = vi.fn();
			const onDismiss = vi.fn();

			renderWithRouter(
				<FileUploadProgress
					uploads={[makeUpload({ status })]}
					onDismiss={onDismiss}
					onCancel={onCancel}
				/>,
			);

			await user.click(screen.getByRole("button"));

			expect(onDismiss).toHaveBeenCalledWith("u1");
			expect(onCancel).not.toHaveBeenCalled();
		},
	);

	it.each(inFlight)("names the button Cancel while %s", (status) => {
		renderWithRouter(
			<FileUploadProgress
				uploads={[makeUpload({ status })]}
				onDismiss={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);

		expect(
			screen.getByRole("button", { name: "Cancel upload of report.pdf" }),
		).toBeInTheDocument();
	});

	it("names the button Dismiss once the upload is terminal", () => {
		renderWithRouter(
			<FileUploadProgress
				uploads={[makeUpload({ status: "success", progress: 100 })]}
				onDismiss={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);

		expect(
			screen.getByRole("button", { name: "Dismiss report.pdf" }),
		).toBeInTheDocument();
	});
});

describe("FileUploadProgress — empty panel", () => {
	it("renders nothing when there are no uploads", () => {
		const { container } = renderWithRouter(
			<FileUploadProgress
				uploads={[]}
				onDismiss={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);

		expect(container).toBeEmptyDOMElement();
	});
});
