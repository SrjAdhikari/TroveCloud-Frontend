//* tests/hooks/useDriveImportFlow.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import toast from "@/lib/toast";
import useDriveImportFlow from "@/hooks/useDriveImportFlow";
import importFromDrive from "@/api/drive.api";
import { openPicker } from "@/lib/googlePicker";
import type { ApiError } from "@/types/api.types";

vi.mock("@/api/drive.api");
vi.mock("@/lib/googlePicker");

vi.mock("@/lib/toast", () => ({
	default: {
		success: vi.fn(),
		error: vi.fn(),
		info: vi.fn(),
		warning: vi.fn(),
	},
}));

// Token request resolves straight to onSuccess, so start() reaches the
// picker without a Google popup.
vi.mock("@react-oauth/google", () => ({
	useGoogleLogin:
		(config: { onSuccess: (token: { access_token: string }) => void }) =>
		() =>
			config.onSuccess({ access_token: "drive-token" }),
}));

const makeWrapper = (client: QueryClient) => {
	return ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={client}>{children}</QueryClientProvider>
	);
};

const renderFlow = () =>
	renderHook(() => useDriveImportFlow(), {
		wrapper: makeWrapper(
			new QueryClient({ defaultOptions: { mutations: { retry: false } } }),
		),
	});

const rejectImportWith = (code: string) => {
	const error: ApiError = { code, message: "backend copy" };
	vi.mocked(importFromDrive).mockRejectedValue(error);
};

// Leaves the import in flight so the test can background it mid-request —
// start() resets the flag, so it can't be set up front.
const deferImport = () => {
	let rejectImport!: (error: ApiError) => void;

	vi.mocked(importFromDrive).mockReturnValue(
		new Promise((_resolve, reject) => {
			rejectImport = reject;
		}),
	);

	return (code: string) => rejectImport({ code, message: "backend copy" });
};

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(openPicker).mockImplementation(async ({ onPicked }) => {
		onPicked([{ id: "d1", mimeType: "application/pdf" }], { d1: "report.pdf" });
	});
});

describe("useDriveImportFlow — top-level error mapping", () => {
	it("maps VALIDATION_ERROR to the pick-again copy", async () => {
		rejectImportWith("VALIDATION_ERROR");
		const { result } = renderFlow();

		act(() => result.current.start());

		await waitFor(() => expect(result.current.status).toBe("error"));
		expect(result.current.error).toBe(
			"We couldn't process your selection. Please pick the files again.",
		);
	});

	it("keeps a mapped 4xx inline instead of toasting it", async () => {
		rejectImportWith("VALIDATION_ERROR");
		const { result } = renderFlow();

		act(() => result.current.start());

		await waitFor(() => expect(result.current.status).toBe("error"));
		expect(toast.error).not.toHaveBeenCalled();
	});

	it("toasts a mapped code once the import is running in the background", async () => {
		const failImport = deferImport();
		const { result } = renderFlow();

		act(() => result.current.start());
		await waitFor(() => expect(result.current.status).toBe("importing"));

		act(() => result.current.setBackground(true));
		await act(async () => {
			failImport("VALIDATION_ERROR");
		});

		await waitFor(() => expect(result.current.status).toBe("error"));
		expect(toast.error).toHaveBeenCalledWith(
			"We couldn't process your selection. Please pick the files again.",
		);
	});

	it("toasts an unmapped code alongside the generic copy", async () => {
		rejectImportWith("SOMETHING_ELSE");
		const { result } = renderFlow();

		act(() => result.current.start());

		await waitFor(() => expect(result.current.status).toBe("error"));
		expect(result.current.error).toBe("Drive import failed. Please try again.");
		expect(toast.error).toHaveBeenCalledWith(
			"Drive import failed. Please try again.",
		);
	});
});
