//* src/components/dashboard/cards/FolderCard.tsx

import { useState } from "react";
import { useSearchParams } from "react-router";

import { formatDate, formatFileSize } from "@/lib/formatters";
import { getFolderIcon } from "@/lib/iconMapper";
import type { DirectoryItemPayload } from "@/types/directory.types";
import ItemActions from "@/components/dashboard/cards/ItemActions";
import RenameDialog from "@/components/dashboard/dialogs/RenameDialog";
import DeleteDialog from "@/components/dashboard/dialogs/DeleteDialog";

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

	/** Builds a short summary string like "3 files · 1.2 MB" */
	const buildMeta = (): string | null => {
		const parts: string[] = [];
		if (folder.fileCount != null) {
			parts.push(`${folder.fileCount} ${folder.fileCount === 1 ? "file" : "files"}`);
		}
		if (folder.totalSize != null) {
			parts.push(formatFileSize(folder.totalSize));
		}
		return parts.length > 0 ? parts.join(" · ") : null;
	};

	const meta = buildMeta();

	return (
		<>
			<div
				role="button"
				tabIndex={0}
				onClick={handleClick}
				onKeyDown={(e) => e.key === "Enter" && handleClick()}
				className="group rounded-xl border border-border bg-card p-4 text-left transition-all hover:bg-accent/50 hover:shadow-sm cursor-pointer"
			>
				{/* Top row — icon + meta + actions */}
				<div className="flex items-start justify-between">
					<div
						className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${bg}`}
					>
						<Icon className={`size-6 ${color}`} />
					</div>

					<div className="flex items-center gap-2">
						{meta && (
							<span className="text-xs text-muted-foreground">
								{meta}
							</span>
						)}
						<ItemActions
							onRename={() => setShowRename(true)}
							onDelete={() => setShowDelete(true)}
						/>
					</div>
				</div>

				{/* Bottom — folder name + date */}
				<div className="mt-4 min-w-0">
					<p className="truncate text-sm font-medium">{folder.name}</p>
					<p className="mt-1 text-xs text-muted-foreground">
						{formatDate(folder.updatedAt)}
					</p>
				</div>
			</div>

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
