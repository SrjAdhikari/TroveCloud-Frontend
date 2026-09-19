//* src/components/dashboard/directory/DirectoryToolbar.tsx

import { FolderPlus, FolderUp, LayoutGrid, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import DriveIcon from "@/components/icons/DriveIcon";

interface DirectoryToolbarProps {
	view: "grid" | "list";
	onNewFolder: () => void;
	onUploadFiles: () => void;
	onImportFromDrive: () => void;
	onToggleView: () => void;
}

/**
 * Toolbar with icon buttons for directory actions —
 * new folder, upload files, upload folder (placeholder),
 * import from drive, and grid/list view toggle.
 */
const DirectoryToolbar = ({
	view,
	onNewFolder,
	onUploadFiles,
	onImportFromDrive,
	onToggleView,
}: DirectoryToolbarProps) => {
	const isGrid = view === "grid";

	return (
		<div className="flex items-center gap-3">
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="outline"
						size="icon"
						aria-label="New Folder"
						onClick={onNewFolder}
						className="size-8 cursor-pointer"
					>
						<FolderPlus aria-hidden="true" className="size-4" />
					</Button>
				</TooltipTrigger>

				<TooltipContent>New Folder</TooltipContent>
			</Tooltip>

			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="outline"
						size="icon"
						aria-label="Upload Files"
						onClick={onUploadFiles}
						className="size-8 cursor-pointer"
					>
						<Upload aria-hidden="true" className="size-4" />
					</Button>
				</TooltipTrigger>

				<TooltipContent>Upload Files</TooltipContent>
			</Tooltip>

			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="outline"
						size="icon"
						aria-label="Upload Folder — Coming soon"
						className="size-8 cursor-pointer"
					>
						<FolderUp aria-hidden="true" className="size-4" />
					</Button>
				</TooltipTrigger>

				<TooltipContent>Upload Folder — Coming soon</TooltipContent>
			</Tooltip>

			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="outline"
						size="icon"
						aria-label="Import from Drive"
						onClick={onImportFromDrive}
						className="size-8 cursor-pointer"
					>
						<DriveIcon className="size-4" aria-hidden="true" />
					</Button>
				</TooltipTrigger>

				<TooltipContent>Import from Drive</TooltipContent>
			</Tooltip>

			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="outline"
						size="icon"
						aria-label="Grid view"
						aria-pressed={isGrid}
						onClick={onToggleView}
						className="size-8 cursor-pointer aria-pressed:bg-muted aria-pressed:text-foreground"
					>
						<LayoutGrid aria-hidden="true" className="size-4" />
					</Button>
				</TooltipTrigger>

				<TooltipContent>Grid view</TooltipContent>
			</Tooltip>
		</div>
	);
};

export default DirectoryToolbar;
