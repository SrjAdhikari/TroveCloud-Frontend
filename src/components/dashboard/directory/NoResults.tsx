//* src/components/dashboard/directory/NoResults.tsx

interface NoResultsProps {
	query: string;
}

/**
 * Placeholder shown when a search query returns no matching files or folders.
 * Displays an illustration with the search term.
 */
const NoResults = ({ query }: NoResultsProps) => {
	return (
		<div className="flex min-h-[calc(100svh-12rem)] flex-col items-center justify-center text-muted-foreground">
			<img
				src="/assets/images/no-data.svg"
				alt="No results illustration"
				className="mb-6 w-64"
			/>

			<h2 className="font-heading text-xl font-semibold text-foreground">
				No results found
			</h2>

			<p className="mt-1 text-sm">
				No files or folders match &ldquo;{query}&rdquo;
			</p>
		</div>
	);
};

export default NoResults;
