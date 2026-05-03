//* src/components/dashboard/directory/DirectoryListView.tsx

import type {
	DirectoryItemPayload,
	FileItemPayload,
} from "@/types/directory.types";
import FolderCard from "@/components/dashboard/cards/FolderCard";
import FileCard from "@/components/dashboard/cards/FileCard";

interface DirectoryListViewProps {
	folders: DirectoryItemPayload[];
	files: FileItemPayload[];
}

/**
 * Directory List View component
 *
 * @param folders - Array of folder items
 * @param files - Array of file items
 * @returns Directory List View component
 */
const DirectoryListView = ({ folders, files }: DirectoryListViewProps) => {
	return (
		<section>
			<div className="hidden md:grid md:grid-cols-[auto_3fr_2fr_4rem] lg:grid-cols-[auto_3fr_2fr_1fr_4rem] items-center gap-4 border-b border-border px-4 pb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
				<span aria-hidden="true" className="size-4" />
				<span>Name</span>
				<span className="text-center">Modified</span>
				<span className="hidden lg:block text-center">Size</span>
				<span className="text-center">Actions</span>
			</div>

			<div className="divide-y divide-border border-b border-border *:hover:bg-muted">
				{folders.map((folder) => (
					<FolderCard key={folder._id} folder={folder} view="list" />
				))}

				{files.map((file) => (
					<FileCard key={file._id} file={file} view="list" />
				))}
			</div>
		</section>
	);
};

export default DirectoryListView;
