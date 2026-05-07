//* src/hooks/useDriveImportFlow.ts

import { useCallback, useRef, useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useQueryClient } from "@tanstack/react-query";

import toast from "@/lib/toast";
import { openPicker } from "@/lib/googlePicker";
import { pluralize } from "@/lib/formatters";

import useDriveImport from "@/hooks/useDriveImport";

import type { ApiError } from "@/types/api.types";
import type { DriveImportResult, DrivePickedItem } from "@/types/drive.types";

type DriveImportStatus = "idle" | "picking" | "importing" | "done" | "error";

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.readonly";

// Backend 4xx codes → inline friendly copy.
// Anything outside this map falls back to GENERIC_ERROR
const TOP_LEVEL_ERROR_MESSAGES: Record<string, string> = {
	INVALID_DRIVE_TOKEN:
		"Your Google Drive session expired. Please reconnect and try again.",
	INVALID_INPUT:
		"We couldn't process your selection. Please pick the files again.",
};

const GENERIC_ERROR = "Drive import failed. Please try again.";
const TOKEN_ERROR =
	"Google sign-in failed. Please try again or check your account.";
const PICKER_ERROR = "Couldn't open Google Drive. Please try again.";

/**
 * Fires the right toast variant for a completion result.
 * - Full success: always toast (foreground dialog auto-closes; background
 *   never had a dialog to begin with).
 * - Partial / full failure: only toast in background — the dialog's result
 *   panel handles foreground feedback.
 */
const fireCompletionToast = (
	data: DriveImportResult,
	isBackground: boolean,
): void => {
	const ok = data.imported.length;
	const fail = data.failed.length;

	if (fail === 0) {
		toast.success(`${pluralize(ok, "file")} imported successfully`);
		return;
	}

	if (!isBackground) return;

	if (ok === 0) {
		toast.error(`${pluralize(fail, "file")} couldn't be imported`);
		return;
	}

	toast.warning(
		`${pluralize(ok, "file")} imported, and ${pluralize(fail, "file")} failed`,
	);
};

interface DriveImportFlow {
	status: DriveImportStatus;
	error: string | null;
	result: DriveImportResult | null;
	/**
	 * {driveId → name} captured from the Picker. Used as a fallback when the
	 * backend returns `failed[].name = null` so failed items can still be
	 * identified by their original Drive name.
	 */
	pickedNames: Record<string, string>;
	start: () => void;
	reset: () => void;
	/**
	 * Dialog calls setBackground(true) when closing mid-import so completion
	 * fires a toast instead of relying on the (unmounted) result panel.
	 */
	setBackground: (value: boolean) => void;
}

/**
 * Drive Import Flow hook.
 * Orchestrates: GIS token (drive.readonly) → Picker → POST /api/drive/import → invalidate ["directory"].
 * State machine: idle → picking → importing → done | error.
 */
const useDriveImportFlow = ({
	parentDirId,
}: { parentDirId?: string } = {}): DriveImportFlow => {
	const [status, setStatus] = useState<DriveImportStatus>("idle");
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<DriveImportResult | null>(null);
	const [pickedNames, setPickedNames] = useState<Record<string, string>>({});

	const queryClient = useQueryClient();
	const { mutate: runImport } = useDriveImport();

	// Ref so dialog open/close transitions don't trigger re-renders.
	const isBackgroundRef = useRef(false);

	const setBackground = useCallback((value: boolean) => {
		isBackgroundRef.current = value;
	}, []);

	const reset = useCallback(() => {
		setStatus("idle");
		setError(null);
		setResult(null);
		setPickedNames({});
		isBackgroundRef.current = false;
	}, []);

	// --- Mutation outcomes ---

	const onMutationSuccess = (data: DriveImportResult) => {
		setResult(data);
		setStatus("done");
		queryClient.invalidateQueries({ queryKey: ["directory"] });
		fireCompletionToast(data, isBackgroundRef.current);
	};

	const onMutationError = (apiError: ApiError) => {
		const friendly = TOP_LEVEL_ERROR_MESSAGES[apiError.code] ?? GENERIC_ERROR;
		setError(friendly);
		setStatus("error");

		const isClientError = apiError.code in TOP_LEVEL_ERROR_MESSAGES;
		if (!isClientError || isBackgroundRef.current) toast.error(friendly);
	};

	// --- Picker outcomes ---

	const onPicked = (
		accessToken: string,
		items: DrivePickedItem[],
		names: Record<string, string>,
	) => {
		if (items.length === 0) {
			setStatus("idle");
			return;
		}
		setPickedNames(names);
		setStatus("importing");
		runImport(
			{ accessToken, items, parentDirId },
			{
				onSuccess: (response) =>
					onMutationSuccess(response.data ?? { imported: [], failed: [] }),
				onError: onMutationError,
			},
		);
	};

	// --- Token outcomes ---

	const onTokenSuccess = async ({ access_token }: { access_token: string }) => {
		if (!access_token) {
			setError(TOKEN_ERROR);
			setStatus("error");
			return;
		}
		try {
			await openPicker({
				accessToken: access_token,
				onPicked: (items, names) => onPicked(access_token, items, names),
				onCancel: () => setStatus("idle"),
			});
		} catch {
			setError(PICKER_ERROR);
			setStatus("error");
		}
	};

	const onTokenError = () => {
		setError(TOKEN_ERROR);
		setStatus("error");
	};

	const onTokenNonOAuthError = (error: { type: string }) => {
		// popup_closed = user dismissed the Google popup. Silent.
		if (error.type === "popup_closed") {
			setStatus("idle");
			return;
		}

		setError(TOKEN_ERROR);
		setStatus("error");
	};

	const requestAccessToken = useGoogleLogin({
		flow: "implicit",
		scope: DRIVE_SCOPE,
		onSuccess: onTokenSuccess,
		onError: onTokenError,
		onNonOAuthError: onTokenNonOAuthError,
	});

	const start = useCallback(() => {
		reset();
		setStatus("picking");
		requestAccessToken();
	}, [reset, requestAccessToken]);

	return {
		status,
		error,
		result,
		pickedNames,
		start,
		reset,
		setBackground,
	};
};

export type { DriveImportFlow };
export default useDriveImportFlow;
