//* tests/components/dashboard/drive-import/DriveImportBody.test.tsx

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import DriveImportBody from "@/components/dashboard/drive-import/DriveImportBody";
import type {
	DriveImportFailureReason,
	DriveImportResult,
} from "@/types/drive.types";

const makeFailedResult = (
	reason: DriveImportFailureReason,
): DriveImportResult => ({
	imported: [],
	failed: [{ driveId: "d1", name: "report.pdf", reason }],
});

const renderResult = (reason: DriveImportFailureReason) =>
	render(
		<DriveImportBody
			status="done"
			error={null}
			result={makeFailedResult(reason)}
			pickedNames={{}}
			onConnect={vi.fn()}
		/>,
	);

describe("DriveImportBody — failure reason copy", () => {
	it("falls back to generic copy for a reason the frontend doesn't map", () => {
		// Casts simulate backend codes outside the known-incomplete union.
		renderResult("SOME_NEW_BACKEND_REASON" as DriveImportFailureReason);

		expect(
			screen.getByText("This item couldn't be imported. Please try again."),
		).toBeInTheDocument();
	});

	it("falls back to generic copy for a prototype-chain key name", () => {
		renderResult("toString" as DriveImportFailureReason);

		expect(
			screen.getByText("This item couldn't be imported. Please try again."),
		).toBeInTheDocument();
	});

	it("keeps the specific copy for a mapped reason", () => {
		renderResult("UNSUPPORTED_DRIVE_TYPE");

		expect(
			screen.getByText(
				"This file type isn't supported yet (Forms, Drawings, etc.).",
			),
		).toBeInTheDocument();
		expect(screen.queryByText(/This item couldn't be imported/)).toBeNull();
	});

	it("quotes the 200 MB per-import cap the backend enforces", () => {
		renderResult("DRIVE_IMPORT_LIMIT_EXCEEDED");

		expect(screen.getByText(/200 MB/)).toBeInTheDocument();
		expect(screen.queryByText(/500 MB/)).toBeNull();
	});
});
