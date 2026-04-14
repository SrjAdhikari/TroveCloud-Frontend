//* src/pages/DashboardPage.tsx

import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { ChevronLeft } from "lucide-react";

import { useCurrentUser } from "@/hooks/useAuth";
import { useCurrentDirectory } from "@/hooks/useDirectory";
import useFileUpload from "@/hooks/useFileUpload";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import FolderCard from "@/components/dashboard/FolderCard";
import FileCard from "@/components/dashboard/FileCard";
import DirectorySkeleton from "@/components/dashboard/DirectorySkeleton";
import CreateFolderDialog from "@/components/dashboard/CreateFolderDialog";
import ToolbarDropdown from "@/components/dashboard/ToolbarDropdown";
import UploadProgress from "@/components/dashboard/UploadProgress";

/**
 * Main dashboard page — fetches and displays the contents of the current directory.
 * Reads the directory ID from the `dir` search param (defaults to root if absent).
 */
const DashboardPage = () => {
	const [showCreateFolder, setShowCreateFolder] = useState(false);
	const navigate = useNavigate();

	const [searchParams] = useSearchParams();
	const dirId = searchParams.get("dir") || undefined;

	const { data: userResponse } = useCurrentUser();
	const rootDirId = userResponse?.data?.rootDirId;

	const { data, isLoading } = useCurrentDirectory(dirId);
	const directory = data?.data;

	const isRoot = !directory?.parentDirId;
	const { uploads, upload, dismiss, cancel } = useFileUpload(dirId);

	/** Navigate to the parent directory. Goes to /dashboard (no params) if parent is root. */
	const handleBack = () => {
		const parentId = directory?.parentDirId;
		if (!parentId || parentId === rootDirId) {
			navigate("/dashboard");
		} else {
			navigate(`/dashboard?dir=${parentId}`);
		}
	};

	if (isLoading) {
		return <DirectorySkeleton />;
	}

	const folders = directory?.childDirectories ?? [];
	const files = directory?.files ?? [];
	const isEmpty = folders.length === 0 && files.length === 0;

	return (
		<div className="space-y-6">
			{/* Directory header — title on the left, toolbar on the right */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					{!isRoot && (
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									size="icon"
									onClick={handleBack}
									className="size-6 rounded-full cursor-pointer"
								>
									<ChevronLeft className="size-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Go Back</TooltipContent>
						</Tooltip>
					)}

					<h1 className="text-lg font-medium">
						{isRoot ? "My Files" : directory?.name}
					</h1>
				</div>

				<ToolbarDropdown
					onNewFolder={() => setShowCreateFolder(true)}
					onUpload={upload}
				/>
			</div>

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

			{/* Create folder dialog */}
			<CreateFolderDialog
				open={showCreateFolder}
				onOpenChange={setShowCreateFolder}
				parentDirId={dirId}
			/>

			{/* Upload progress panel — fixed bottom-right */}
			<UploadProgress
				uploads={uploads}
				onDismiss={dismiss}
				onCancel={cancel}
			/>
		</div>
	);
};

export default DashboardPage;
