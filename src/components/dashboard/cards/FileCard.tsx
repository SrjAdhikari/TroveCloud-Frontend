//* src/components/dashboard/cards/FileCard.tsx

import { useState } from "react";

import toast from "@/lib/toast";
import { formatDateTime, formatBytes } from "@/lib/formatters";
import { getFileIcon } from "@/lib/iconMapper";

import type { FileItemPayload } from "@/types/directory.types";
import { useDownloadFile } from "@/hooks/useFile";

import ItemActions from "@/components/dashboard/cards/ItemActions";
import RenameDialog from "@/components/dashboard/dialogs/RenameDialog";
import DeleteDialog from "@/components/dashboard/dialogs/DeleteDialog";
import FilePreviewDialog from "@/components/dashboard/dialogs/FilePreviewDialog";
import DetailsDialog from "@/components/dashboard/dialogs/DetailsDialog";

interface FileCardProps {
	file: FileItemPayload;
	currentPath: string;
	view?: "grid" | "list";
}

const ROW_WRAPPER =
	"col-span-full grid grid-cols-subgrid items-center gap-4 group border-b border-border transition-colors hover:bg-muted";

// Button spans cells 1..N-1 (icon, name, modified, size); ItemActions is cell N.
const ROW_BUTTON_CELLS =
	"col-span-2 md:col-span-3 lg:col-span-4 grid grid-cols-subgrid items-center gap-4 px-4 py-2 text-left cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring";

/**
 * Renders a single file as a card with an icon based on its extension.
 * Includes a three-dot menu for rename, download, and delete actions.
 */
const FileCard = ({ file, currentPath, view = "grid" }: FileCardProps) => {
	const [showPreview, setShowPreview] = useState(false);
	const [showRename, setShowRename] = useState(false);
	const [showDelete, setShowDelete] = useState(false);
	const [showDetails, setShowDetails] = useState(false);

	const { src } = getFileIcon(file.extension);
	const { mutate: download } = useDownloadFile();

	const sizeText = file.size != null ? formatBytes(file.size) : null;

	/**
	 * Downloads the file by fetching it as a Blob, creating a temporary
	 * object URL, and programmatically clicking a hidden anchor element.
	 */
	const handleDownload = () => {
		download(file._id, {
			onSuccess: (blob) => {
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = file.name;
				a.click();
				URL.revokeObjectURL(url);
			},
			onError: () => {
				toast.error("Couldn't download the file. Please try again.");
			},
		});
	};

	return (
		<>
			{view === "list" ? (
				<div className={ROW_WRAPPER}>
					<button
						type="button"
						onClick={() => setShowPreview(true)}
						className={ROW_BUTTON_CELLS}
					>
						<div className="flex size-8 shrink-0 items-center justify-center">
							<img
								src={src}
								alt={`${file.extension} file`}
								className="size-7"
							/>
						</div>

						<div className="min-w-0">
							<p className="truncate text-sm font-medium">{file.name}</p>
						</div>

						<span className="hidden md:block text-sm text-muted-foreground text-center">
							{formatDateTime(file.updatedAt)}
						</span>

						<span className="hidden lg:block text-sm text-muted-foreground text-center">
							{sizeText ?? "--"}
						</span>
					</button>

					<div className="flex justify-center">
						<ItemActions
							onRename={() => setShowRename(true)}
							onDelete={() => setShowDelete(true)}
							onDetails={() => setShowDetails(true)}
							onPreview={() => setShowPreview(true)}
							onDownload={handleDownload}
						/>
					</div>
				</div>
			) : (
				<div
					role="button"
					tabIndex={0}
					onClick={() => setShowPreview(true)}
					onKeyDown={(e) => e.key === "Enter" && setShowPreview(true)}
					className="group relative cursor-pointer rounded-xl border border-border bg-background p-4 text-left transition-all"
				>
					{/* Action menu — absolute top-right so it doesn't break centering */}
					<div className="absolute right-2 top-2">
						<ItemActions
							onRename={() => setShowRename(true)}
							onDelete={() => setShowDelete(true)}
							onDetails={() => setShowDetails(true)}
							onPreview={() => setShowPreview(true)}
							onDownload={handleDownload}
						/>
					</div>

					{/* Centered icon + file name */}
					<div className="flex flex-col items-center gap-3">
						<div className="flex size-14 shrink-0 items-center justify-center">
							<img
								src={src}
								alt={`${file.extension} file`}
								className="size-14"
							/>
						</div>

						<p className="w-full truncate text-center text-sm font-medium">
							{file.name}
						</p>
					</div>

					<hr className="my-3 -mx-4 border-border" />

					<div className="mt-2 space-y-1 text-center text-xs text-muted-foreground">
						<p className="truncate">{sizeText ?? "—"}</p>
						<p>{formatDateTime(file.updatedAt)}</p>
					</div>
				</div>
			)}

			{showPreview && (
				<FilePreviewDialog
					onClose={() => setShowPreview(false)}
					file={file}
					onDownload={handleDownload}
				/>
			)}

			{showDetails && (
				<DetailsDialog
					onClose={() => setShowDetails(false)}
					currentPath={currentPath}
					type="file"
					item={file}
				/>
			)}

			{showRename && (
				<RenameDialog
					onClose={() => setShowRename(false)}
					itemId={file._id}
					currentName={file.name}
					type="file"
				/>
			)}

			{showDelete && (
				<DeleteDialog
					onClose={() => setShowDelete(false)}
					itemId={file._id}
					itemName={file.name}
					type="file"
				/>
			)}
		</>
	);
};

export default FileCard;
