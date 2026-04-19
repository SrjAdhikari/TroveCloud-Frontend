//* src/components/dashboard/EmptyDirectory.tsx

/**
 * Placeholder shown when a directory has no files or folders.
 * Displays an illustration with a helpful message.
 */
const EmptyDirectory = () => {
	return (
		<div className="flex min-h-[calc(100svh-7rem)] flex-col items-center justify-center text-muted-foreground">
			<img
				src="/assets/images/empty-folder.svg"
				alt="Empty folder illustration"
				className="mb-6 w-64"
			/>

			<h2 className="font-heading text-xl font-semibold text-foreground">
				This folder is empty
			</h2>

			<p className="mt-1 text-sm">
				Upload files or create a folder to get started
			</p>
		</div>
	);
};

export default EmptyDirectory;
