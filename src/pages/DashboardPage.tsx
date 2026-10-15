//* src/pages/DashboardPage.tsx

import { useCallback } from "react";

import useViewToggle from "@/hooks/useViewToggle";
import useDirectoryContents from "@/hooks/useDirectoryContents";
import useSidebarActions from "@/hooks/useSidebarActions";
import useFileUpload from "@/hooks/useFileUpload";
import useDriveImportFlow from "@/hooks/useDriveImportFlow";

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
 * The My Files page. Shows the folder named by `dir` in the URL, or the
 * top-level folder if there's none.
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

	// Stays the same between renders so the dialog's auto-close doesn't re-run.
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
	const currentPath = directory?.path ?? "";

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

			{/* Page content, with the layout's usual padding and spacing */}
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
					<DirectoryListView
						folders={folders}
						files={files}
						currentPath={currentPath}
					/>
				) : (
					<DirectoryGridView
						folders={folders}
						files={files}
						currentPath={currentPath}
					/>
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
