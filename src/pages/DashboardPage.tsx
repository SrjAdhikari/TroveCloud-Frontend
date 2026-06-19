//* src/pages/DashboardPage.tsx

import { useCallback } from "react";

import useViewToggle from "@/hooks/useViewToggle";
import useDirectoryContents from "@/hooks/useDirectoryContents";
import useSidebarActions from "@/hooks/useSidebarActions";
import useFileUpload from "@/hooks/useFileUpload";
import useDriveImportFlow from "@/hooks/useDriveImportFlow";

import FolderCard from "@/components/dashboard/cards/FolderCard";
import FileCard from "@/components/dashboard/cards/FileCard";
import Breadcrumbs from "@/components/dashboard/directory/Breadcrumbs";
import DirectoryGridView from "@/components/dashboard/directory/DirectoryGridView";
import DirectoryListView from "@/components/dashboard/directory/DirectoryListView";
import DirectoryLoadFailed from "@/components/dashboard/directory/DirectoryLoadFailed";
import DirectoryToolbar from "@/components/dashboard/directory/DirectoryToolbar";
import EmptyDirectory from "@/components/dashboard/directory/EmptyDirectory";
import NoResults from "@/components/dashboard/directory/NoResults";
import CreateFolderDialog from "@/components/dashboard/dialogs/CreateFolderDialog";
import FileUploadDialog from "@/components/dashboard/dialogs/FileUploadDialog";
import DriveImportDialog from "@/components/dashboard/dialogs/DriveImportDialog";
import FileUploadProgress from "@/components/dashboard/upload/FileUploadProgress";
import LoadingSpinner from "@/components/ui/loading-spinner";

/**
 * Main dashboard page — fetches and displays the contents of the current directory.
 * Reads the directory ID from the `dir` search param (defaults to root if absent).
 */
const DashboardPage = () => {
	const { view, toggleView } = useViewToggle();
	const {
		dirId,
		directory,
		isLoading,
		error,
		isRoot,
		folders,
		files,
		isEmpty,
		searchQuery,
		rawQuery,
	} = useDirectoryContents();
	const {
		showCreateFolder,
		setShowCreateFolder,
		showUpload,
		setShowUpload,
		showDriveImport,
		setShowDriveImport,
	} = useSidebarActions();
	const { uploads, upload, dismiss, cancel } = useFileUpload(dirId);
	const driveImportFlow = useDriveImportFlow({ parentDirId: dirId });

	// Stable reference so DriveImportDialog's auto-close effect doesn't re-fire
	// on every parent render.
	const handleCloseDriveImport = useCallback(
		() => setShowDriveImport(false),
		[setShowDriveImport],
	);

	if (isLoading) {
		return <LoadingSpinner fullScreen />;
	}

	if (error) {
		return <DirectoryLoadFailed error={error} />;
	}

	const displayName = isRoot ? "My Files" : (directory?.name ?? "");

	return (
		<div className="-m-6">
			<div className="space-y-2 border-b px-3 py-2 sm:px-6">
				{!isRoot && (
					<Breadcrumbs breadcrumb={directory?.breadcrumb ?? []} />
				)}

				<div className="flex items-center justify-between gap-4">
					<h1 className="truncate text-xl font-medium md:text-2xl">
						{displayName}
					</h1>

					<DirectoryToolbar
						view={view}
						onNewFolder={() => setShowCreateFolder(true)}
						onUploadFiles={() => setShowUpload(true)}
						onImportFromDrive={() => setShowDriveImport(true)}
						onToggleView={toggleView}
					/>
				</div>
			</div>

			{/* Page content — re-add the layout's p-6 padding + vertical rhythm */}
			<div className="space-y-6 p-6">
				{isEmpty ? (
					searchQuery ? (
						<NoResults query={rawQuery} />
					) : (
						<EmptyDirectory
							onUploadFiles={() => setShowUpload(true)}
							onNewFolder={() => setShowCreateFolder(true)}
						/>
					)
				) : view === "list" ? (
					<DirectoryListView folders={folders} files={files} />
				) : (
					<>
						{folders.length > 0 && (
							<DirectoryGridView title="Folders">
								{folders.map((folder) => (
									<FolderCard key={folder._id} folder={folder} view={view} />
								))}
							</DirectoryGridView>
						)}

						{files.length > 0 && (
							<DirectoryGridView title="Files">
								{files.map((file) => (
									<FileCard key={file._id} file={file} view={view} />
								))}
							</DirectoryGridView>
						)}
					</>
				)}
			</div>

			{/* Create folder dialog */}
			{showCreateFolder && (
				<CreateFolderDialog
					onClose={() => setShowCreateFolder(false)}
					parentDirId={dirId}
				/>
			)}

			{/* Upload dialog */}
			{showUpload && (
				<FileUploadDialog
					onClose={() => setShowUpload(false)}
					onUpload={upload}
				/>
			)}

			{/* Drive Import dialog */}
			{showDriveImport && driveImportFlow.status !== "picking" && (
				<DriveImportDialog
					flow={driveImportFlow}
					onClose={handleCloseDriveImport}
				/>
			)}

			{/* Upload progress panel — fixed bottom-right */}
			<FileUploadProgress
				uploads={uploads}
				onDismiss={dismiss}
				onCancel={cancel}
			/>
		</div>
	);
};

export default DashboardPage;
