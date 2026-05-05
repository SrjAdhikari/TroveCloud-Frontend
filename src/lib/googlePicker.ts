//* src/lib/googlePicker.ts

/**
 * Google Picker SDK loader + helper.
 * Powers the Drive Import flow — frontend gets {id, mimeType}[] from the
 * Picker, hands them to POST /api/drive/import which streams the bytes
 * server-side using the supplied access token.
 *
 * Why a custom loader (not @react-oauth/google) — the OAuth package only
 * handles the GIS sign-in script. The Picker is a separate SDK living on
 * apis.google.com/js/api.js and must be loaded on demand.
 */

import { GOOGLE_API_KEY, GOOGLE_CLIENT_ID } from "@/lib/constants";
import type { DrivePickedItem } from "@/types/drive.types";

// Minimal type surface for what we use from window.gapi / window.google.picker.
// Keeps the call site type-safe without pulling in @types/gapi.picker.
declare global {
	interface Window {
		gapi?: {
			load: (
				name: string,
				options: { callback: () => void; onerror?: () => void },
			) => void;
		};
		google?: {
			picker: GooglePicker;
		};
	}
}

interface GooglePicker {
	PickerBuilder: new () => PickerBuilder;
	DocsView: new () => DocsView;
	Action: { PICKED: string; CANCEL: string };
	Feature: { MULTISELECT_ENABLED: string };
}

interface PickerBuilder {
	addView: (view: DocsView) => PickerBuilder;
	setOAuthToken: (token: string) => PickerBuilder;
	setDeveloperKey: (key: string) => PickerBuilder;
	setAppId: (appId: string) => PickerBuilder;
	setCallback: (cb: (response: PickerResponse) => void) => PickerBuilder;
	enableFeature: (feature: string) => PickerBuilder;
	build: () => Picker;
}

interface DocsView {
	setIncludeFolders: (include: boolean) => DocsView;
	setSelectFolderEnabled: (enabled: boolean) => DocsView;
}

interface Picker {
	setVisible: (visible: boolean) => void;
}

interface PickerResponse {
	action: string;
	docs?: Array<{ id: string; mimeType: string }>;
}

const PICKER_SCRIPT_URL = "https://apis.google.com/js/api.js";

// Module-level cache so repeated openPicker() calls only load the SDK once.
let pickerLoadPromise: Promise<void> | null = null;

/**
 * Loads the Google Picker SDK on demand.
 * Idempotent — repeated calls return the same cached promise.
 * Rejects with a clear, actionable message if VITE_GOOGLE_API_KEY is missing.
 * (Drive Import needs an API key with Picker API + Drive API enabled, separate from the OAuth client ID).
 * On load failure the cache is cleared so a future call can retry.
 */
const loadPickerApi = (): Promise<void> => {
	if (pickerLoadPromise) return pickerLoadPromise;

	if (!GOOGLE_API_KEY) {
		return Promise.reject(
			new Error(
				"Drive Import is not configured: VITE_GOOGLE_API_KEY is missing. " +
					"Add a Google Cloud API key (with Picker API + Drive API enabled) to .env.",
			),
		);
	}

	pickerLoadPromise = new Promise<void>((resolve, reject) => {
		const loadPickerModule = () => {
			window.gapi!.load("picker", {
				callback: () => resolve(),
				onerror: () => reject(new Error("Failed to load Google Picker module")),
			});
		};

		// gapi may already be present if loaded by another flow.
		if (window.gapi) {
			loadPickerModule();
			return;
		}

		const script = document.createElement("script");
		script.src = PICKER_SCRIPT_URL;
		script.async = true;
		script.defer = true;
		script.onload = loadPickerModule;
		script.onerror = () =>
			reject(new Error("Failed to load Google Picker SDK"));
		document.head.appendChild(script);
	});

	// Reset cache on failure so a retry can re-attempt the load.
	pickerLoadPromise.catch(() => {
		pickerLoadPromise = null;
	});

	return pickerLoadPromise;
};

interface OpenPickerOptions {
	accessToken: string;
	onPicked: (items: DrivePickedItem[]) => void;
	onCancel?: () => void;
}

/**
 * Opens the Google Picker UI.
 * Awaits the SDK load if not yet ready.
 * Shows files + folders with multi-select enabled.
 * Hands picked items back as {id, mimeType}[] — exactly what POST /api/drive/import expects.
 * Folder picks are imported recursively server-side.
 */
const openPicker = async ({
	accessToken,
	onPicked,
	onCancel,
}: OpenPickerOptions): Promise<void> => {
	await loadPickerApi();

	// Cloud project number — required by Picker so the drive.file scope grants
	// our app read access to picked items. It's the numeric prefix of the OAuth
	// client ID. Without setAppId, picked items return DRIVE_ITEM_NOT_FOUND when
	// the backend tries to fetch them with the access token.
	const appId = GOOGLE_CLIENT_ID.split("-")[0];

	const view = new window.google!.picker.DocsView()
		.setIncludeFolders(true)
		.setSelectFolderEnabled(true);

	const picker = new window.google!.picker.PickerBuilder()
		.addView(view)
		.setOAuthToken(accessToken)
		.setDeveloperKey(GOOGLE_API_KEY!)
		.setAppId(appId)
		.enableFeature(window.google!.picker.Feature.MULTISELECT_ENABLED)
		.setCallback((response) => {
			if (response.action === window.google!.picker.Action.PICKED) {
				const items = (response.docs ?? []).map((doc) => ({
					id: doc.id,
					mimeType: doc.mimeType,
				}));
				onPicked(items);
			} else if (response.action === window.google!.picker.Action.CANCEL) {
				onCancel?.();
			}
		})
		.build();

	picker.setVisible(true);
};

export { loadPickerApi, openPicker };
