//* src/components/dashboard/DirectorySkeleton.tsx

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading skeleton for the directory listing.
 * Shows placeholder cards that match the grid layout of FolderCard/FileCard.
 */
const DirectorySkeleton = () => {
	return (
		<div className="space-y-6">
			{/* Folder skeleton section */}
			<section>
				<Skeleton className="mb-3 h-4 w-16" />
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
					{Array.from({ length: 4 }).map((_, i) => (
						<div
							key={i}
							className="flex items-center gap-3 rounded-lg border border-border p-3"
						>
							<Skeleton className="size-10 rounded-lg" />
							<Skeleton className="h-4 flex-1" />
						</div>
					))}
				</div>
			</section>

			{/* File skeleton section */}
			<section>
				<Skeleton className="mb-3 h-4 w-12" />
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
					{Array.from({ length: 6 }).map((_, i) => (
						<div
							key={i}
							className="flex items-center gap-3 rounded-lg border border-border p-3"
						>
							<Skeleton className="size-10 rounded-lg" />
							<Skeleton className="h-4 flex-1" />
						</div>
					))}
				</div>
			</section>
		</div>
	);
};

export default DirectorySkeleton;
