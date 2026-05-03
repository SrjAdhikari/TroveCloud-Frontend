//* src/components/dashboard/directory/EmptyDirectory.tsx

import { FolderOpen, FolderPlus, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import DirectoryPlaceholder from "@/components/dashboard/directory/DirectoryPlaceholder";

interface EmptyDirectoryProps {
	onUploadFiles: () => void;
	onNewFolder: () => void;
}

/**
 * Placeholder shown when a directory has no files or folders.
 * Renders Upload + Create folder CTAs so the empty state is also a starting point.
 */
const EmptyDirectory = ({ onUploadFiles, onNewFolder }: EmptyDirectoryProps) => {
	return (
		<DirectoryPlaceholder
			icon={FolderOpen}
			title="No files or folders yet"
			description="Upload files or create a folder to get started"
		>
			<div className="flex flex-wrap items-center justify-center gap-3">
				<Button onClick={onUploadFiles} className="cursor-pointer">
					<Upload aria-hidden="true" className="size-4" />
					Upload Files
				</Button>

				<Button
					onClick={onNewFolder}
					variant="outline"
					className="cursor-pointer"
				>
					<FolderPlus aria-hidden="true" className="size-4" />
					Create Folder
				</Button>
			</div>
		</DirectoryPlaceholder>
	);
};

export default EmptyDirectory;
