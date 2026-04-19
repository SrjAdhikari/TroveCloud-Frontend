//* src/pages/DashboardPage.tsx

import { useState, useEffect } from "react";
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
import FolderCard from "@/components/dashboard/cards/FolderCard";
import FileCard from "@/components/dashboard/cards/FileCard";
import DirectorySkeleton from "@/components/dashboard/DirectorySkeleton";
import DirectoryToolbar from "@/components/dashboard/DirectoryToolbar";
import EmptyDirectory from "@/components/dashboard/EmptyDirectory";
import CreateFolderDialog from "@/components/dashboard/dialogs/CreateFolderDialog";
import UploadDialog from "@/components/dashboard/dialogs/UploadDialog";
import UploadProgress from "@/components/dashboard/UploadProgress";

/**
 * Main dashboard page — fetches and displays the contents of the current directory.
 * Reads the directory ID from the `dir` search param (defaults to root if absent).
 */
const STORAGE_KEY = "view";

/**
 * Reads the saved view preference from localStorage.
 * Falls back to "grid" if no preference is stored.
 */
const getSavedView = (): "grid" | "list" => {
	const saved = localStorage.getItem(STORAGE_KEY);
	return saved === "list" ? "list" : "grid";
};

/** CSS class for the grid/list container shared by folders and files sections */
const getContainerClass = (view: "grid" | "list") =>
	view === "grid"
		? "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
		: "rounded-xl border border-border bg-card divide-y divide-border";

const DashboardPage = () => {
	const [showCreateFolder, setShowCreateFolder] = useState(false);
	const [showUpload, setShowUpload] = useState(false);
	const [view, setView] = useState<"grid" | "list">(getSavedView);
	const navigate = useNavigate();

	const [searchParams] = useSearchParams();
	const dirId = searchParams.get("dir") || undefined;

	const { data: userResponse } = useCurrentUser();
	const rootDirId = userResponse?.data?.rootDirId;

	const { data, isLoading } = useCurrentDirectory(dirId);
	const directory = data?.data;

	const isRoot = !directory?.parentDirId;
	const { uploads, upload, dismiss, cancel } = useFileUpload(dirId);

	/** Listen for actions dispatched from the sidebar "New" button */
	useEffect(() => {
		const handleAction = (e: Event) => {
			const action = (e as CustomEvent).detail;
			if (action === "new-folder") setShowCreateFolder(true);
			if (action === "upload-files") setShowUpload(true);
		};

		window.addEventListener("dashboard:action", handleAction);
		return () => window.removeEventListener("dashboard:action", handleAction);
	}, []);

	/** Toggle between grid and list view, persisting the choice in localStorage. */
	const toggleView = () => {
		const next = view === "grid" ? "list" : "grid";
		setView(next);
		localStorage.setItem(STORAGE_KEY, next);
	};

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

	const searchQuery = searchParams.get("q")?.toLowerCase() || "";

	/** Filter folders and files by name when a search query is active */
	const folders = (directory?.childDirectories ?? []).filter((f) =>
		f.name.toLowerCase().includes(searchQuery),
	);
	const files = (directory?.files ?? []).filter((f) =>
		f.name.toLowerCase().includes(searchQuery),
	);
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

				<DirectoryToolbar
					view={view}
					onNewFolder={() => setShowCreateFolder(true)}
					onUploadFiles={() => setShowUpload(true)}
					onToggleView={toggleView}
				/>
			</div>

			{isEmpty ? (
				searchQuery ? (
					<div className="flex min-h-[calc(100svh-12rem)] flex-col items-center justify-center text-muted-foreground">
						<h2 className="font-heading text-xl font-semibold text-foreground">
							No results found
						</h2>
						<p className="mt-1 text-sm">
							No files or folders match &ldquo;{searchParams.get("q")}&rdquo;
						</p>
					</div>
				) : (
					<EmptyDirectory />
				)
			) : (
				<>
					{/* Folders */}
					{folders.length > 0 && (
						<section>
							<h2 className="mb-3 text-sm font-medium text-muted-foreground">
								Folders
							</h2>

							<div className={getContainerClass(view)}>
								{folders.map((folder) => (
									<FolderCard key={folder._id} folder={folder} view={view} />
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

							<div className={getContainerClass(view)}>
								{files.map((file) => (
									<FileCard key={file._id} file={file} view={view} />
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

			{/* Upload dialog */}
			<UploadDialog
				open={showUpload}
				onOpenChange={setShowUpload}
				onUpload={upload}
			/>

			{/* Upload progress panel — fixed bottom-right */}
			<UploadProgress uploads={uploads} onDismiss={dismiss} onCancel={cancel} />
		</div>
	);
};

export default DashboardPage;
