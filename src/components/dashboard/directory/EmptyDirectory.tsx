//* src/components/dashboard/directory/EmptyDirectory.tsx

import { FolderOpen } from "lucide-react";

/**
 * Placeholder shown when a directory has no files or folders.
 */
const EmptyDirectory = () => {
	return (
		<div className="flex min-h-[calc(100svh-11rem)] items-center justify-center text-muted-foreground py-10">
			<div className="flex flex-col items-center gap-6">
				<div className="rounded-3xl bg-primary/5 p-6">
					<FolderOpen className="size-14 md:size-16 text-primary" strokeWidth={1} />
				</div>

				<div className="text-center">
					<h3 className="text-lg md:text-xl font-medium text-foreground">
						No files or folders yet
					</h3>

					<p className="mt-1 text-sm">
						Upload files or create a folder to get started
					</p>
				</div>
			</div>
		</div>
	);
};

export default EmptyDirectory;
