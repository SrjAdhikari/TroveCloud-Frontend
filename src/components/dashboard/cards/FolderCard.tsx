//* src/components/dashboard/cards/FolderCard.tsx

import { useState } from "react";
import { useSearchParams } from "react-router";

import { formatDateTime, formatBytes } from "@/lib/formatters";
import { FOLDER_ICON } from "@/lib/iconMapper";

import type { DirectoryItemPayload } from "@/types/directory.types";

import ItemCardLayout from "@/components/dashboard/cards/ItemCardLayout";
import ItemActions from "@/components/dashboard/cards/ItemActions";
import RenameDialog from "@/components/dashboard/dialogs/RenameDialog";
import DeleteDialog from "@/components/dashboard/dialogs/DeleteDialog";
import DetailsDialog from "@/components/dashboard/dialogs/DetailsDialog";

interface FolderCardProps {
	folder: DirectoryItemPayload;
	currentPath: string;
	view?: "grid" | "list";
}

/**
 * Renders a single folder as a clickable card.
 * Clicking navigates into the folder by setting the `dir` search param.
 */
const FolderCard = ({
	folder,
	currentPath,
	view = "grid",
}: FolderCardProps) => {
	const [showRename, setShowRename] = useState(false);
	const [showDelete, setShowDelete] = useState(false);
	const [showDetails, setShowDetails] = useState(false);

	const [, setSearchParams] = useSearchParams();
	const { icon: FolderGlyph, className: iconClassName } = FOLDER_ICON;

	const fileCountText =
		folder.fileCount != null
			? `${folder.fileCount} ${folder.fileCount === 1 ? "file" : "files"}`
			: null;

	const sizeText =
		folder.totalSize != null ? formatBytes(folder.totalSize) : null;

	const icon = (
		<FolderGlyph
			aria-hidden="true"
			className={`${view === "grid" ? "size-12" : "size-7"} ${iconClassName}`}
		/>
	);

	const name =
		view === "grid" ? (
			<p
				title={folder.name}
				className="w-full truncate text-center text-sm font-medium"
			>
				{folder.name}
			</p>
		) : (
			<div className="flex min-w-0 items-center gap-3">
				<p className="truncate text-sm font-medium">{folder.name}</p>
				{fileCountText && (
					<span className="shrink-0 text-xs text-muted-foreground">
						({fileCountText})
					</span>
				)}
			</div>
		);

	return (
		<>
			<ItemCardLayout
				view={view}
				to={{ search: `?dir=${folder._id}` }}
				onActivate={() => setSearchParams({ dir: folder._id })}
				icon={icon}
				name={name}
				modified={formatDateTime(folder.updatedAt)}
				size={sizeText ?? "--"}
				actions={
					<ItemActions
						onRename={() => setShowRename(true)}
						onDelete={() => setShowDelete(true)}
						onDetails={() => setShowDetails(true)}
					/>
				}
			/>

			{showRename && (
				<RenameDialog
					onClose={() => setShowRename(false)}
					itemId={folder._id}
					currentName={folder.name}
					type="folder"
				/>
			)}

			{showDelete && (
				<DeleteDialog
					onClose={() => setShowDelete(false)}
					itemId={folder._id}
					itemName={folder.name}
					type="folder"
				/>
			)}

			{showDetails && (
				<DetailsDialog
					onClose={() => setShowDetails(false)}
					currentPath={currentPath}
					type="folder"
					item={folder}
				/>
			)}
		</>
	);
};

export default FolderCard;
