//* src/pages/DashboardPage.tsx

import useViewToggle from "@/hooks/useViewToggle";
import useDirectoryContents from "@/hooks/useDirectoryContents";
import useSidebarActions from "@/hooks/useSidebarActions";
import useFileUpload from "@/hooks/useFileUpload";

import FolderCard from "@/components/dashboard/cards/FolderCard";
import FileCard from "@/components/dashboard/cards/FileCard";
import BackButton from "@/components/dashboard/directory/BackButton";
import DirectorySection from "@/components/dashboard/directory/DirectorySection";
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
	const { dirId, directory, isLoading, isRoot, folders, files, isEmpty, searchQuery, rawQuery, handleBack } = useDirectoryContents();
	const { showCreateFolder, setShowCreateFolder, showUpload, setShowUpload } = useSidebarActions();
	const { uploads, upload, dismiss, cancel } = useFileUpload(dirId);

	if (isLoading) {
		return null;
	}

	return (
		<div className="space-y-6">
			{/* Directory header — title on the left, toolbar on the right */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					{!isRoot && <BackButton onClick={handleBack} />}

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

			{/* Directory contents */}
			{isEmpty ? (
				searchQuery ? (
					<NoResults query={rawQuery} />
				) : (
					<EmptyDirectory />
				)
			) : (
				<>
					{/* Folders */}
					{folders.length > 0 && (
						<DirectorySection title="Folders" view={view}>
							{folders.map((folder) => (
								<FolderCard key={folder._id} folder={folder} view={view} />
							))}
						</DirectorySection>
					)}

					{/* Files */}
					{files.length > 0 && (
						<DirectorySection title="Files" view={view}>
							{files.map((file) => (
								<FileCard key={file._id} file={file} view={view} />
							))}
						</DirectorySection>
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
