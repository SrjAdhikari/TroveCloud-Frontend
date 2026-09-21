//* tests/components/dashboard/drive-import/DriveImportBody.test.tsx

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import DriveImportBody from "@/components/dashboard/drive-import/DriveImportBody";
import type {
	DriveImportFailureReason,
	DriveImportResult,
} from "@/types/drive.types";

const makeResult = (
	reasons: DriveImportFailureReason[],
	importedCount: number,
): DriveImportResult => ({
	imported: Array.from({ length: importedCount }, (_, index) => ({
		driveId: `i${index + 1}`,
		troveId: `t${index + 1}`,
		name: `imported-${index + 1}.pdf`,
		kind: "file" as const,
	})),
	failed: reasons.map((reason, index) => ({
		driveId: `d${index + 1}`,
		name: `report-${index + 1}.pdf`,
		reason,
	})),
});

const renderResult = (
	reasons: DriveImportFailureReason[],
	{ onConnect = vi.fn(), importedCount = 0 } = {},
) => {
	render(
		<DriveImportBody
			status="done"
			error={null}
			result={makeResult(reasons, importedCount)}
			pickedNames={{}}
			onConnect={onConnect}
		/>,
	);

	return onConnect;
};

const RECONNECT_BUTTON = /reconnect google drive/i;
const TOKEN_ITEM_LABEL =
	"Your Google Drive session expired. Please reconnect and try again.";

describe("DriveImportBody — failure reason copy", () => {
	it("falls back to generic copy for a reason the frontend doesn't map", () => {
		// Casts simulate backend codes outside the known-incomplete union.
		renderResult(["SOME_NEW_BACKEND_REASON" as DriveImportFailureReason]);

		expect(
			screen.getByText("This item couldn't be imported. Please try again."),
		).toBeInTheDocument();
	});

	it("falls back to generic copy for a prototype-chain key name", () => {
		renderResult(["toString" as DriveImportFailureReason]);

		expect(
			screen.getByText("This item couldn't be imported. Please try again."),
		).toBeInTheDocument();
	});

	it("keeps the specific copy for a mapped reason", () => {
		renderResult(["UNSUPPORTED_DRIVE_TYPE"]);

		expect(
			screen.getByText(
				"This file type isn't supported yet (Forms, Drawings, etc.).",
			),
		).toBeInTheDocument();
		expect(screen.queryByText(/This item couldn't be imported/)).toBeNull();
	});

	it("quotes the 200 MB per-import cap the backend enforces", () => {
		renderResult(["DRIVE_IMPORT_LIMIT_EXCEEDED"]);

		expect(screen.getByText(/200 MB/)).toBeInTheDocument();
		expect(screen.queryByText(/500 MB/)).toBeNull();
	});

});

describe("DriveImportBody — failed item naming", () => {
	it("falls back to the picked name when the backend sends none", () => {
		render(
			<DriveImportBody
				status="done"
				error={null}
				result={{
					imported: [],
					failed: [
						{ driveId: "d1", name: null, reason: "UNSUPPORTED_DRIVE_TYPE" },
					],
				}}
				pickedNames={{ d1: "picked-name.pdf" }}
				onConnect={vi.fn()}
			/>,
		);

		expect(screen.getByText("picked-name.pdf")).toBeInTheDocument();
	});
});

describe("DriveImportBody — expired Drive token", () => {
	it("offers a reconnect action when every failure is a token failure", () => {
		renderResult(["INVALID_DRIVE_TOKEN", "INVALID_DRIVE_TOKEN"]);

		expect(
			screen.getByText("Google Drive session expired"),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: RECONNECT_BUTTON }),
		).toBeInTheDocument();
	});

	it("drops the per-item list when every failure is a token failure", () => {
		renderResult(["INVALID_DRIVE_TOKEN", "INVALID_DRIVE_TOKEN"]);

		expect(screen.queryByText("report-1.pdf")).toBeNull();
		expect(screen.queryByText("report-2.pdf")).toBeNull();
	});

	it("still reports how many files failed once the list is dropped", () => {
		renderResult(["INVALID_DRIVE_TOKEN", "INVALID_DRIVE_TOKEN"]);

		expect(screen.getByText(/2 files couldn't be imported/)).toBeInTheDocument();
	});

	it("starts a fresh connect when the reconnect action is used", async () => {
		const onConnect = renderResult(["INVALID_DRIVE_TOKEN"]);

		await userEvent.click(
			screen.getByRole("button", { name: RECONNECT_BUTTON }),
		);

		expect(onConnect).toHaveBeenCalledOnce();
	});

	it("labels a token failure specifically when other reasons are mixed in", () => {
		renderResult(["INVALID_DRIVE_TOKEN", "UNSUPPORTED_DRIVE_TYPE"]);

		expect(screen.getByText(TOKEN_ITEM_LABEL)).toBeInTheDocument();
		expect(screen.queryByText(/This item couldn't be imported/)).toBeNull();
	});

	it("keeps the per-item list when a non-token failure is mixed in", () => {
		renderResult(["INVALID_DRIVE_TOKEN", "UNSUPPORTED_DRIVE_TYPE"]);

		expect(screen.getByText("report-1.pdf")).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: RECONNECT_BUTTON }),
		).toBeNull();
	});

	// Reconnecting discards `result`, so a partial success keeps the list.
	it("keeps the per-item list when files imported before the token expired", () => {
		renderResult(["INVALID_DRIVE_TOKEN", "INVALID_DRIVE_TOKEN"], {
			importedCount: 2,
		});

		expect(
			screen.queryByRole("button", { name: RECONNECT_BUTTON }),
		).toBeNull();
		expect(screen.getByText("report-1.pdf")).toBeInTheDocument();
		expect(screen.getByText("imported-1.pdf")).toBeInTheDocument();
	});

	it("leaves failures without a token reason untouched", () => {
		renderResult(["UNSUPPORTED_DRIVE_TYPE"]);

		expect(
			screen.queryByRole("button", { name: RECONNECT_BUTTON }),
		).toBeNull();
	});
});
