//* src/components/dashboard/FileCard.tsx

import { useState } from "react";
import { toast } from "sonner";

import { formatDate } from "@/lib/dateFormatters";
import { getFileIcon } from "@/lib/iconMapper";
import type { FileItemPayload } from "@/types/directory.types";
import { useDownloadFile } from "@/hooks/useFile";
import ItemActions from "@/components/dashboard/ItemActions";
import RenameDialog from "@/components/dashboard/RenameDialog";
import DeleteDialog from "@/components/dashboard/DeleteDialog";

interface FileCardProps {
	file: FileItemPayload;
}

/**
 * Renders a single file as a card with an icon based on its extension.
 * Includes a three-dot menu for rename, download, and delete actions.
 */
const FileCard = ({ file }: FileCardProps) => {
	const [showRename, setShowRename] = useState(false);
	const [showDelete, setShowDelete] = useState(false);
	const { icon: Icon, color } = getFileIcon(file.extension);
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
			<div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent">
				<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
					<Icon className={`size-5 ${color}`} />
				</div>
				
				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-medium">{file.name}</p>
					<p className="text-xs text-muted-foreground">
						{formatDate(file.updatedAt)}
					</p>
				</div>

				<ItemActions
					onRename={() => setShowRename(true)}
					onDelete={() => setShowDelete(true)}
					onDownload={handleDownload}
				/>
			</div>

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
