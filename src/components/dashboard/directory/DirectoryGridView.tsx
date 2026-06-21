//* src/components/dashboard/directory/DirectoryGridView.tsx

import type { ReactNode } from "react";

import type {
	DirectoryItemPayload,
	FileItemPayload,
} from "@/types/directory.types";

import FolderCard from "@/components/dashboard/cards/FolderCard";
import FileCard from "@/components/dashboard/cards/FileCard";

interface DirectoryGridViewProps {
	folders: DirectoryItemPayload[];
	files: FileItemPayload[];
	currentPath: string;
}

/** Titled section wrapping a responsive auto-fill card grid. */
const GridSection = ({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) => (
	<section>
		<h2 className="mb-3 text-sm font-medium text-muted-foreground">{title}</h2>

		<div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3">
			{children}
		</div>
	</section>
);

/**
 * Directory Grid View component
 *
 * @param folders - Array of folder items
 * @param files - Array of file items
 * @param currentPath - Path of the directory currently being viewed
 * @returns Directory Grid View component
 */
const DirectoryGridView = ({
	folders,
	files,
	currentPath,
}: DirectoryGridViewProps) => {
	return (
		<div className="space-y-6">
			{folders.length > 0 && (
				<GridSection title="Folders">
					{folders.map((folder) => (
						<FolderCard
							key={folder._id}
							folder={folder}
							currentPath={currentPath}
							view="grid"
						/>
					))}
				</GridSection>
			)}

			{files.length > 0 && (
				<GridSection title="Files">
					{files.map((file) => (
						<FileCard
							key={file._id}
							file={file}
							currentPath={currentPath}
							view="grid"
						/>
					))}
				</GridSection>
			)}
		</div>
	);
};

export default DirectoryGridView;
