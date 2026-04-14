//* src/components/dashboard/FolderCard.tsx

import { useState } from "react";
import { useSearchParams } from "react-router";

import { formatDate } from "@/lib/dateFormatters";
import { getFolderIcon } from "@/lib/iconMapper";
import type { DirectoryItemPayload } from "@/types/directory.types";
import ItemActions from "@/components/dashboard/ItemActions";
import RenameDialog from "@/components/dashboard/RenameDialog";
import DeleteDialog from "@/components/dashboard/DeleteDialog";

interface FolderCardProps {
	folder: DirectoryItemPayload;
}

/**
 * Renders a single folder as a clickable card.
 * Clicking navigates into the folder by updating the `dir` search param.
 */
const FolderCard = ({ folder }: FolderCardProps) => {
	const [showRename, setShowRename] = useState(false);
	const [showDelete, setShowDelete] = useState(false);

	const [, setSearchParams] = useSearchParams();
	const { icon: Icon, color, bg } = getFolderIcon(folder.name);

	/** Navigate into this folder by setting the dir search param */
	const handleClick = () => {
		setSearchParams({ dir: folder._id });
	};

	return (
		<>
			<button
				onClick={handleClick}
				className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-accent cursor-pointer"
			>
				<div
					className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${bg}`}
				>
					<Icon className={`size-5 ${color}`} />
				</div>

				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-medium">{folder.name}</p>
					<p className="text-xs text-muted-foreground">
						{formatDate(folder.updatedAt)}
					</p>
				</div>

				<ItemActions
					onRename={() => setShowRename(true)}
					onDelete={() => setShowDelete(true)}
				/>
			</button>

			<RenameDialog
				open={showRename}
				onOpenChange={setShowRename}
				itemId={folder._id}
				currentName={folder.name}
				type="folder"
			/>

			<DeleteDialog
				open={showDelete}
				onOpenChange={setShowDelete}
				itemId={folder._id}
				itemName={folder.name}
				type="folder"
			/>
		</>
	);
};

export default FolderCard;
