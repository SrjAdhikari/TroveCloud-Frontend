//* src/components/dashboard/SearchBar.tsx

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";

import SearchInput from "@/components/ui/search-input";

/**
 * Search box in the dashboard header. Saves the search in the URL (`q`),
 * waiting 300ms after typing stops. Clearing with X updates the list at once.
 */
const SearchBar = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [query, setQuery] = useState(searchParams.get("q") || "");
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Update the box when the URL changes some other way, like Back or Forward.
	useEffect(() => {
		const urlQuery = searchParams.get("q") ?? "";
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setQuery((prev) => (prev === urlQuery ? prev : urlQuery));
	}, [searchParams]);

	const syncQueryParam = useCallback(
		(value: string) => {
			setSearchParams(
				(prev) => {
					const next = new URLSearchParams(prev);
					if (value.trim()) {
						next.set("q", value.trim());
					} else {
						next.delete("q");
					}
					return next;
				},
				{ replace: true },
			);
		},
		[setSearchParams],
	);

	useEffect(() => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => syncQueryParam(query), 300);

		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, [query, syncQueryParam]);

	return (
		<SearchInput
			label="Search files and folders"
			value={query}
			onChange={setQuery}
			onClear={() => syncQueryParam("")}
			placeholder="Search files and folders..."
			className="w-full max-w-lg xl:max-w-xl"
		/>
	);
};

export default SearchBar;
