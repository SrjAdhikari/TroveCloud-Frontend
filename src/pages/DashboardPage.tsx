//* src/pages/DashboardPage.tsx

import useViewToggle from "@/hooks/useViewToggle";
import useDirectoryContents from "@/hooks/useDirectoryContents";
import useSidebarActions from "@/hooks/useSidebarActions";
import useFileUpload from "@/hooks/useFileUpload";

import FolderCard from "@/components/dashboard/cards/FolderCard";
import FileCard from "@/components/dashboard/cards/FileCard";
import Breadcrumbs from "@/components/dashboard/directory/Breadcrumbs";
import DirectoryGridView from "@/components/dashboard/directory/DirectoryGridView";
import DirectoryListView from "@/components/dashboard/directory/DirectoryListView";
import DirectoryToolbar from "@/components/dashboard/directory/DirectoryToolbar";
import EmptyDirectory from "@/components/dashboard/directory/EmptyDirectory";
import NoResults from "@/components/dashboard/directory/NoResults";
import CreateFolderDialog from "@/components/dashboard/dialogs/CreateFolderDialog";
import UploadDialog from "@/components/dashboard/dialogs/UploadDialog";
import UploadProgress from "@/components/dashboard/UploadProgress";

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
		isRoot,
		folders,
		files,
		isEmpty,
		searchQuery,
		rawQuery,
	} = useDirectoryContents();
	const { showCreateFolder, setShowCreateFolder, showUpload, setShowUpload } =
		useSidebarActions();
	const { uploads, upload, dismiss, cancel } = useFileUpload(dirId);

	if (isLoading) {
		return null;
	}

	const displayName = isRoot ? "My Files" : (directory?.name ?? "");

	return (
		<div className="-m-6">
			<div className="space-y-2 border-b px-3 py-2 sm:px-6">
				{!isRoot && (
					<Breadcrumbs
						ancestors={directory?.ancestors ?? []}
						currentName={displayName}
					/>
				)}

				<div className="flex items-center justify-between gap-4">
					<h1 className="truncate text-xl font-medium md:text-2xl">
						{displayName}
					</h1>

					<DirectoryToolbar
						view={view}
						onNewFolder={() => setShowCreateFolder(true)}
						onUploadFiles={() => setShowUpload(true)}
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
