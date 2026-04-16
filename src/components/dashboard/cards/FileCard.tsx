//* src/components/dashboard/cards/FileCard.tsx

import { useState } from "react";
import { toast } from "sonner";

import { formatDate, formatFileSize } from "@/lib/formatters";
import { getFileIcon } from "@/lib/iconMapper";
import type { FileItemPayload } from "@/types/directory.types";
import { useDownloadFile } from "@/hooks/useFile";
import ItemActions from "@/components/dashboard/cards/ItemActions";
import RenameDialog from "@/components/dashboard/dialogs/RenameDialog";
import DeleteDialog from "@/components/dashboard/dialogs/DeleteDialog";
import FilePreviewDialog from "@/components/dashboard/dialogs/FilePreviewDialog";

interface FileCardProps {
	file: FileItemPayload;
}

/**
 * Renders a single file as a card with an icon based on its extension.
 * Includes a three-dot menu for rename, download, and delete actions.
 */
const FileCard = ({ file }: FileCardProps) => {
	const [showPreview, setShowPreview] = useState(false);
	const [showRename, setShowRename] = useState(false);
	const [showDelete, setShowDelete] = useState(false);

	const { icon: Icon, color, src } = getFileIcon(file.extension);
	const { mutate: download } = useDownloadFile();

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
			onError: (error) => {
				toast.error(error.message || "Failed to download file");
			},
		});
	};

	return (
		<>
			<div
				role="button"
				tabIndex={0}
				onClick={() => setShowPreview(true)}
				onKeyDown={(e) => e.key === "Enter" && setShowPreview(true)}
				className="group rounded-xl border border-border bg-card p-4 text-left transition-all hover:bg-accent/50 hover:shadow-sm cursor-pointer"
			>
				{/* Top row — icon + file size + actions */}
				<div className="flex items-start justify-between">
					<div className="flex size-12 shrink-0 items-center justify-center">
						{src ? (
							<img src={src} alt="" className="size-12" />
						) : (
							<Icon className={`size-8 ${color}`} />
						)}
					</div>

					<div className="flex items-center gap-2">
						{file.size != null && (
							<span className="text-xs text-muted-foreground">
								{formatFileSize(file.size)}
							</span>
						)}
						<ItemActions
							onRename={() => setShowRename(true)}
							onDelete={() => setShowDelete(true)}
							onPreview={() => setShowPreview(true)}
							onDownload={handleDownload}
						/>
					</div>
				</div>

				{/* Bottom — file name + date */}
				<div className="mt-4 min-w-0">
					<p className="truncate text-sm font-medium">{file.name}</p>
					<p className="mt-1 text-xs text-muted-foreground">
						{formatDate(file.updatedAt)}
					</p>
				</div>
			</div>

			<FilePreviewDialog
				open={showPreview}
				onOpenChange={setShowPreview}
				file={file}
				onDownload={handleDownload}
			/>

			<RenameDialog
				open={showRename}
				onOpenChange={setShowRename}
				itemId={file._id}
				currentName={file.name}
				type="file"
			/>
			<DeleteDialog
				open={showDelete}
				onOpenChange={setShowDelete}
				itemId={file._id}
				itemName={file.name}
				type="file"
			/>
		</>
	);
};

export default FileCard;
