//* src/components/dashboard/cards/FolderCard.tsx

import { useState } from "react";
import { Link, useSearchParams } from "react-router";

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

const ROW_WRAPPER =
	"col-span-full grid grid-cols-subgrid items-center gap-4 group border-b border-border transition-colors hover:bg-muted";

// Link spans cells 1..N-1 (icon, name, modified, size); ItemActions is cell N.
const ROW_LINK_CELLS =
	"col-span-2 md:col-span-3 lg:col-span-4 grid grid-cols-subgrid items-center gap-4 px-4 py-2 cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring";

/**
 * Renders a single folder as a clickable card.
 * Clicking navigates into the folder by setting the `dir` search param.
 */
const FolderCard = ({ folder, view = "grid" }: FolderCardProps) => {
	const [showRename, setShowRename] = useState(false);
	const [showDelete, setShowDelete] = useState(false);

	const [, setSearchParams] = useSearchParams();
	const { icon: Icon, color, bg } = getFolderIcon(folder.name);

	const handleClick = () => {
		setSearchParams({ dir: folder._id });
	};

	const fileCountText =
		folder.fileCount != null
			? `${folder.fileCount} ${folder.fileCount === 1 ? "file" : "files"}`
			: null;

	const sizeText =
		folder.totalSize != null ? formatFileSize(folder.totalSize) : null;

	const metadata =
		[fileCountText, sizeText].filter(Boolean).join(" · ") || null;

	return (
		<>
			{view === "list" ? (
				<div className={ROW_WRAPPER}>
					<Link
						to={{ search: `?dir=${folder._id}` }}
						className={ROW_LINK_CELLS}
					>
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
					</Link>

					<div className="flex justify-center">
						<ItemActions
							onRename={() => setShowRename(true)}
							onDelete={() => setShowDelete(true)}
						/>
					</div>
				</div>
			) : (
				<div
					role="button"
					tabIndex={0}
					onClick={handleClick}
					onKeyDown={(e) => e.key === "Enter" && handleClick()}
					className="group relative cursor-pointer rounded-xl border border-border bg-background p-4 text-left transition-all"
				>
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
						<p className="truncate">{metadata ?? "—"}</p>
						<p>{formatDateTime(folder.updatedAt)}</p>
					</div>
				</div>
			)}

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
		</>
	);
};

export default FolderCard;
