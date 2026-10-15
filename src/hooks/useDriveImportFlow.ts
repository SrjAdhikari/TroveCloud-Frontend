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

const TOP_LEVEL_ERROR_MESSAGES: Record<string, string> = {
	VALIDATION_ERROR:
		"We couldn't process your selection. Please pick the files again.",
};

const GENERIC_ERROR = "Drive import failed. Please try again.";
const TOKEN_ERROR =
	"Google sign-in failed. Please try again or check your account.";
const PICKER_ERROR = "Couldn't open Google Drive. Please try again.";

/**
 * Always shows a toast when everything imported. When some items failed,
 * shows one only if the dialog was closed; an open dialog shows the result.
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

export interface DriveImportFlow {
	status: DriveImportStatus;
	error: string | null;
	result: DriveImportResult | null;
	pickedNames: Record<string, string>;
	start: () => void;
	reset: () => void;
	setBackground: (value: boolean) => void;
}

/**
 * Steps: get Google access, let the user pick files, import them, then refresh
 * the folder and storage usage.
 * Status: idle → picking → importing → done | error.
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

	// Stored in a ref so opening or closing the dialog doesn't cause a re-render.
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
		queryClient.invalidateQueries({ queryKey: ["storageUsage"] });
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
		// The user closed the Google popup, so there's nothing to report.
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

export default useDriveImportFlow;
