//* src/components/dashboard/cards/FileCard.tsx

import { useState } from "react";

import toast from "@/lib/toast";
import { formatDateTime, formatBytes } from "@/lib/formatters";
import { getFileIcon } from "@/lib/iconMapper";

import type { FileItemPayload } from "@/types/directory.types";
import { useDownloadFile } from "@/hooks/useFile";

import ItemCardLayout from "@/components/dashboard/cards/ItemCardLayout";
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
	const baseName = file.name.slice(0, -file.extension.length) || file.name;

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

	const icon = (
		<img
			src={src}
			alt={`${file.extension} file`}
			className={view === "grid" ? "size-12" : "size-7"}
		/>
	);

	const name =
		view === "grid" ? (
			// Split the name so end-truncation keeps the extension visible.
			<p
				title={file.name}
				className="flex w-full justify-center text-sm font-medium"
			>
				<span className="min-w-0 truncate">{baseName}</span>
				<span className="shrink-0">{file.extension}</span>
			</p>
		) : (
			<div className="min-w-0">
				<p className="truncate text-sm font-medium">{file.name}</p>
			</div>
		);

	return (
		<>
			<ItemCardLayout
				view={view}
				onActivate={() => setShowPreview(true)}
				icon={icon}
				name={name}
				modified={formatDateTime(file.updatedAt)}
				size={sizeText ?? "--"}
				actions={
					<ItemActions
						onRename={() => setShowRename(true)}
						onDelete={() => setShowDelete(true)}
						onDetails={() => setShowDetails(true)}
						onPreview={() => setShowPreview(true)}
						onDownload={handleDownload}
					/>
				}
			/>

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
