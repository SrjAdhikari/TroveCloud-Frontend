//* src/hooks/useTheme.ts

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "theme";

type Theme = "light" | "dark" | "system";

const getSystemTheme = (): "light" | "dark" =>
	window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const getStoredTheme = (): Theme =>
	(localStorage.getItem(STORAGE_KEY) as Theme) || "system";

const applyTheme = (theme: Theme) => {
	const resolved = theme === "system" ? getSystemTheme() : theme;
	document.documentElement.classList.toggle("dark", resolved === "dark");
};

// Apply the theme right away so the page doesn't flash the wrong one.
applyTheme(getStoredTheme());

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
