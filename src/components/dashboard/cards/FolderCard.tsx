//* src/components/dashboard/cards/FolderCard.tsx

import { useState } from "react";
import { useSearchParams } from "react-router";

import { formatDateTime, formatFileSize } from "@/lib/formatters";
import { getFolderIcon } from "@/lib/iconMapper";
import type { DirectoryItemPayload } from "@/types/directory.types";
import ItemActions from "@/components/dashboard/cards/ItemActions";
import RenameDialog from "@/components/dashboard/dialogs/RenameDialog";
import DeleteDialog from "@/components/dashboard/dialogs/DeleteDialog";

interface FolderCardProps {
	folder: DirectoryItemPayload;
	view?: "grid" | "list";
}

/**
 * Renders a single folder as a clickable card.
 * Clicking navigates into the folder by updating the `dir` search param.
 */
const FolderCard = ({ folder, view = "grid" }: FolderCardProps) => {
	const [showRename, setShowRename] = useState(false);
	const [showDelete, setShowDelete] = useState(false);

	const [, setSearchParams] = useSearchParams();
	const { icon: Icon, color, bg } = getFolderIcon(folder.name);

	/** Navigate into this folder by setting the dir search param */
	const handleClick = () => {
		setSearchParams({ dir: folder._id });
	};

	const fileCountText =
		folder.fileCount != null
			? `${folder.fileCount} ${folder.fileCount === 1 ? "file" : "files"}`
			: null;

	const sizeText =
		folder.totalSize != null ? formatFileSize(folder.totalSize) : null;

	const listMeta =
		[fileCountText, sizeText].filter(Boolean).join(" · ") || null;

	return (
		<>
			<div
				role="button"
				tabIndex={0}
				onClick={handleClick}
				onKeyDown={(e) => e.key === "Enter" && handleClick()}
				className={`group text-left transition-all cursor-pointer ${
					view === "list"
						? "grid grid-cols-[auto_1fr_4rem] md:grid-cols-[auto_3fr_2fr_4rem] lg:grid-cols-[auto_3fr_2fr_1fr_4rem] items-center gap-4 px-4 py-2"
						: "relative rounded-xl border border-border bg-background p-4"
				}`}
			>
				{view === "list" ? (
					<>
						<div
							className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${bg}`}
						>
							<Icon className={`size-5 ${color}`} />
						</div>

						<div className="flex min-w-0 items-center gap-3">
							<p className="truncate text-sm font-medium">{folder.name}</p>
							{fileCountText && (
								<span className="shrink-0 text-xs text-muted-foreground">
									({fileCountText})
								</span>
							)}
						</div>

						<span className="hidden md:block text-sm text-muted-foreground text-center">
							{formatDateTime(folder.updatedAt)}
						</span>

						<span className="hidden lg:block text-sm text-muted-foreground text-center">
							{sizeText ?? "--"}
						</span>

						<div className="flex justify-center">
							<ItemActions
								onRename={() => setShowRename(true)}
								onDelete={() => setShowDelete(true)}
							/>
						</div>
					</>
				) : (
					<>
						{/* Action menu - top right corner */}
						<div className="absolute right-2 top-2">
							<ItemActions
								onRename={() => setShowRename(true)}
								onDelete={() => setShowDelete(true)}
							/>
						</div>

						{/* Centered icon + folder name */}
						<div className="flex flex-col items-center gap-3">
							<div
								className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${bg}`}
							>
								<Icon className={`size-6 ${color}`} />
							</div>

							<p className="w-full truncate text-center text-sm font-medium">
								{folder.name}
							</p>
						</div>

						<hr className="my-3 -mx-4 border-border" />

						{/* Folder metadata */}
						<div className="mt-2 space-y-1 text-center text-xs text-muted-foreground">
							<p className="truncate">{listMeta ?? "—"}</p>
							<p>{formatDateTime(folder.updatedAt)}</p>
						</div>
					</>
				)}
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
