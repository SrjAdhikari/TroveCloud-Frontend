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

// Types for just the parts of Google's Picker we use, so we don't need the
// @types/gapi.picker package.
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
	setSize: (width: number, height: number) => PickerBuilder;
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
	docs?: Array<{ id: string; mimeType: string; name: string }>;
}

const PICKER_SCRIPT_URL = "https://apis.google.com/js/api.js";

// Saved so Google's Picker script is only loaded once.
let pickerLoadPromise: Promise<void> | null = null;

/**
 * Loads Google's Picker script once, the first time it's needed.
 * Fails with a clear message if VITE_GOOGLE_API_KEY is missing. This key needs
 * the Picker and Drive APIs turned on. If loading fails, the next call retries.
 */
export const loadPickerApi = (): Promise<void> => {
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

		// Google's script may already be loaded by another part of the app.
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

	// If loading failed, forget it so the next call tries again.
	pickerLoadPromise.catch(() => {
		pickerLoadPromise = null;
	});

	return pickerLoadPromise;
};

interface OpenPickerOptions {
	accessToken: string;
	onPicked: (items: DrivePickedItem[], names: Record<string, string>) => void;
	onCancel?: () => void;
}

/**
 * Opens Google's file picker, where the user can pick many files and folders.
 * Returns them as {id, mimeType}[], ready to send to the import API.
 * Picked folders are imported with everything inside them.
 */
export const openPicker = async ({
	accessToken,
	onPicked,
	onCancel,
}: OpenPickerOptions): Promise<void> => {
	await loadPickerApi();

	// The Picker needs the app ID, which is the first part of the OAuth client ID.
	const appId = GOOGLE_CLIENT_ID.split("-")[0];

	// Fit the Picker inside the window, with a maximum size for large screens.
	const width = Math.min(window.innerWidth - 64, 1051);
	const height = Math.min(window.innerHeight - 64, 650);

	const view = new window.google!.picker.DocsView()
		.setIncludeFolders(true)
		.setSelectFolderEnabled(true);

	const picker = new window.google!.picker.PickerBuilder()
		.addView(view)
		.setOAuthToken(accessToken)
		.setDeveloperKey(GOOGLE_API_KEY!)
		.setAppId(appId)
		.setSize(width, height)
		.enableFeature(window.google!.picker.Feature.MULTISELECT_ENABLED)
		.setCallback((response) => {
			if (response.action === window.google!.picker.Action.PICKED) {
				const docs = response.docs ?? [];
				const items = docs.map((doc) => ({
					id: doc.id,
					mimeType: doc.mimeType,
				}));

				const names: Record<string, string> = Object.fromEntries(
					docs.map((doc) => [doc.id, doc.name]),
				);

				onPicked(items, names);
			} else if (response.action === window.google!.picker.Action.CANCEL) {
				onCancel?.();
			}
		})
		.build();

	picker.setVisible(true);
};
