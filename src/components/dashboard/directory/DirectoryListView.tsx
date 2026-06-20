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
	currentPath: string;
}

const TABLE_GRID =
	"grid grid-cols-[auto_1fr_4rem] md:grid-cols-[auto_3fr_2fr_4rem] lg:grid-cols-[auto_3fr_2fr_1fr_4rem]";

/**
 * Directory List View component
 *
 * @param folders - Array of folder items
 * @param files - Array of file items
 * @param currentPath - Path of the directory currently being viewed
 * @returns Directory List View component
 */
const DirectoryListView = ({
	folders,
	files,
	currentPath,
}: DirectoryListViewProps) => {
	return (
		<section className={TABLE_GRID}>
			<div className="hidden md:grid col-span-full grid-cols-subgrid items-center gap-4 border-b border-border px-4 pb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
				<span aria-hidden="true" className="size-4" />
				<span>Name</span>
				<span className="text-center">Modified</span>
				<span className="hidden lg:block text-center">Size</span>
				<span className="text-center">Actions</span>
			</div>

			{folders.map((folder) => (
				<FolderCard
					key={folder._id}
					folder={folder}
					currentPath={currentPath}
					view="list"
				/>
			))}

			{files.map((file) => (
				<FileCard
					key={file._id}
					file={file}
					currentPath={currentPath}
					view="list"
				/>
			))}
		</section>
	);
};

export default DirectoryListView;
