//* src/components/dashboard/SearchBar.tsx

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { Search, X } from "lucide-react";

/**
 * Search input for the dashboard header bar.
 * Syncs the query with the `q` search param in the URL,
 * debouncing input to avoid excessive re-renders.
 */
const SearchBar = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [query, setQuery] = useState(searchParams.get("q") || "");
	const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

	/** Sync the `q` search param after a short debounce */
	useEffect(() => {
		if (debounceRef.current) clearTimeout(debounceRef.current);

		debounceRef.current = setTimeout(() => {
			setSearchParams(
				(prev) => {
					const next = new URLSearchParams(prev);
					if (query.trim()) {
						next.set("q", query.trim());
					} else {
						next.delete("q");
					}
					return next;
				},
				{ replace: true },
			);
		}, 300);

		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, [query, setSearchParams]);

	/** Clear search input and remove `q` param */
	const handleClear = () => {
		setQuery("");
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				next.delete("q");
				return next;
			},
			{ replace: true },
		);
	};

	return (
		<div className="relative w-full max-w-lg xl:max-w-xl">
			<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

			<input
				type="text"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				placeholder="Search files and folders..."
				className="h-9 w-full rounded-lg border border-border bg-muted/50 pl-9 pr-9 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-ring focus:bg-background transition-colors"
			/>

			{query && (
				<button
					type="button"
					onClick={handleClear}
					className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
				>
					<X className="size-4" />
				</button>
			)}
		</div>
	);
};

export default SearchBar;
