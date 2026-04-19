//* src/hooks/useViewToggle.ts

import { useState } from "react";

const STORAGE_KEY = "view";

/**
 * Reads the saved view preference from localStorage.
 * Falls back to "grid" if no preference is stored.
 */
const getSavedView = (): "grid" | "list" => {
	const saved = localStorage.getItem(STORAGE_KEY);
	return saved === "list" ? "list" : "grid";
};

/**
 * Manages grid/list view toggle state with localStorage persistence.
 * Reusable across any page that needs a view switcher.
 */
const useViewToggle = () => {
	const [view, setView] = useState<"grid" | "list">(getSavedView);

	const toggleView = () => {
		const next = view === "grid" ? "list" : "grid";
		setView(next);
		localStorage.setItem(STORAGE_KEY, next);
	};

	return { view, toggleView };
};

export default useViewToggle;
