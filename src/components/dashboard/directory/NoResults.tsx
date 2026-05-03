//* src/components/dashboard/directory/NoResults.tsx

import { SearchX } from "lucide-react";

import DirectoryPlaceholder from "@/components/dashboard/directory/DirectoryPlaceholder";

interface NoResultsProps {
	query: string;
}

/**
 * Placeholder shown when a search query returns no matching files or folders.
 */
const NoResults = ({ query }: NoResultsProps) => {
	return (
		<DirectoryPlaceholder
			icon={SearchX}
			title="No results found"
			description={<>No files or folders match your search for &ldquo;{query}&rdquo;</>}
		/>
	);
};

export default NoResults;
