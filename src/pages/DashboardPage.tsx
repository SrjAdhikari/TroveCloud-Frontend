//* src/pages/DashboardPage.tsx

import { useSearchParams } from "react-router";

import { useCurrentDirectory } from "@/hooks/useDirectory";
import FolderCard from "@/components/dashboard/FolderCard";
import FileCard from "@/components/dashboard/FileCard";
import DirectorySkeleton from "@/components/dashboard/DirectorySkeleton";

/**
 * Main dashboard page — fetches and displays the contents of the current directory.
 * Reads the directory ID from the `dir` search param (defaults to root if absent).
 */
const DashboardPage = () => {
	const [searchParams] = useSearchParams();
	const dirId = searchParams.get("dir") || undefined;

	const { data, isLoading } = useCurrentDirectory(dirId);
	const directory = data?.data;

	if (isLoading) {
		return <DirectorySkeleton />;
	}

	const folders = directory?.childDirectories ?? [];
	const files = directory?.files ?? [];
	const isEmpty = folders.length === 0 && files.length === 0;

	return (
		<div className="space-y-6">
			{isEmpty ? (
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
			) : (
				<>
					{/* Folders */}
					{folders.length > 0 && (
						<section>
							<h2 className="mb-3 text-sm font-medium text-muted-foreground">
								Folders
							</h2>
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
								{folders.map((folder) => (
									<FolderCard key={folder._id} folder={folder} />
								))}
							</div>
						</section>
					)}

					{/* Files */}
					{files.length > 0 && (
						<section>
							<h2 className="mb-3 text-sm font-medium text-muted-foreground">
								Files
							</h2>
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
								{files.map((file) => (
									<FileCard key={file._id} file={file} />
								))}
							</div>
						</section>
					)}
				</>
			)}
		</div>
	);
};

export default DashboardPage;
