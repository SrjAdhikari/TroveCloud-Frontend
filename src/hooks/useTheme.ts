//* src/hooks/useTheme.ts

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "theme";

type Theme = "light" | "dark" | "system";

/**
 * Resolves the effective theme (light or dark) based on OS preference.
 * Used when the user has selected "system" or has no stored preference.
 */
const getSystemTheme = (): "light" | "dark" =>
	window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

/**
 * Reads the user's theme choice from localStorage.
 * Returns "system" if nothing is stored.
 */
const getStoredTheme = (): Theme =>
	(localStorage.getItem(STORAGE_KEY) as Theme) || "system";

/**
 * Applies the correct `.dark` class on <html> based on the stored theme.
 * If "system", follows the OS preference.
 */
const applyTheme = (theme: Theme) => {
	const resolved = theme === "system" ? getSystemTheme() : theme;
	document.documentElement.classList.toggle("dark", resolved === "dark");
};

// Initialize theme on first import so there's no flash of wrong theme
applyTheme(getStoredTheme());

/**
 * Hook for reading and setting the current theme (light, dark, or system).
 * Uses useSyncExternalStore to stay in sync with localStorage.
 */
const useTheme = () => {
	const theme = useSyncExternalStore(
		(callback) => {
			window.addEventListener("storage", callback);
			return () => window.removeEventListener("storage", callback);
		},
		getStoredTheme,
	);

	const setTheme = useCallback((next: Theme) => {
		localStorage.setItem(STORAGE_KEY, next);
		applyTheme(next);
		window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
	}, []);

	return { theme, setTheme };
};

export default useTheme;
