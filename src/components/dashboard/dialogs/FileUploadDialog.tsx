//* src/components/dashboard/dialogs/FileUploadDialog.tsx

import { useState } from "react";

import splitFilesBySize from "@/lib/fileSize";
import { checkUploadQuota } from "@/lib/storage";
import useFileSelection from "@/hooks/useFileSelection";
import useStorageUsage from "@/hooks/useStorageUsage";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import FileDropZone from "@/components/dashboard/upload/FileDropZone";
import FileLimitAlert from "@/components/dashboard/upload/FileLimitAlert";
import SelectedFileList from "@/components/dashboard/upload/SelectedFileList";
import StorageQuotaAlert from "@/components/dashboard/upload/StorageQuotaAlert";

interface FileUploadDialogProps {
	onClose: () => void;
	onUpload: (files: FileList) => void;
}

const QUOTA_ALERT_ID = "upload-quota-alert";

/**
 * Custom upload dialog with drag-and-drop zone and file preview list.
 * Replaces the native file picker with a more polished experience.
 * Selected files are passed to the parent's onUpload callback on confirm.
 */
const FileUploadDialog = ({ onClose, onUpload }: FileUploadDialogProps) => {
	const [oversizedNames, setOversizedNames] = useState<string[]>([]);
	const { selectedFiles, addFiles, removeFile, totalSize } = useFileSelection();
	const { data: storageResponse } = useStorageUsage();
	const { blocked, remaining } = checkUploadQuota(
		totalSize,
		storageResponse?.data,
	);

	/** Reject oversized files at add-time so the backend never sees them. */
	const acceptFiles = (incoming: FileList | File[]) => {
		const { allowed, oversized } = splitFilesBySize(Array.from(incoming));

		if (oversized.length > 0) {
			setOversizedNames(oversized.map((file) => file.name));
		} else {
			setOversizedNames([]);
		}

		if (allowed.length > 0) addFiles(allowed);
	};

	/** Converts the File[] back to a FileList-like object and triggers upload */
	const handleUpload = () => {
		if (selectedFiles.length === 0 || blocked) return;

		const dataTransfer = new DataTransfer();
		selectedFiles.forEach((file) => dataTransfer.items.add(file));

		onUpload(dataTransfer.files);
		onClose();
	};

	return (
		<Dialog open onOpenChange={(isOpen) => !isOpen && onClose()}>
			<DialogContent className="sm:max-w-lg bg-background gap-0 p-0 top-[50%] max-h-[90vh] flex flex-col">
				<DialogHeader className="p-5">
					<DialogTitle>Upload Files</DialogTitle>
					<DialogDescription>
						Drag and drop files or browse to select.
					</DialogDescription>
				</DialogHeader>

				<Separator />

				<div className="flex-1 overflow-y-auto space-y-4 p-5">
					<FileDropZone onFiles={acceptFiles} />

					<FileLimitAlert names={oversizedNames} />

					<StorageQuotaAlert
						id={QUOTA_ALERT_ID}
						blocked={blocked}
						remaining={remaining}
						selectedSize={totalSize}
					/>

					<SelectedFileList
						files={selectedFiles}
						totalSize={totalSize}
						onRemove={removeFile}
					/>
				</div>

				<Separator />

				<div className="flex justify-end gap-2 p-5">
					<Button
						variant="outline"
						onClick={onClose}
						className="cursor-pointer"
					>
						Cancel
					</Button>

					<Button
						onClick={handleUpload}
						disabled={selectedFiles.length === 0}
						aria-disabled={blocked}
						aria-describedby={blocked ? QUOTA_ALERT_ID : undefined}
						className="cursor-pointer aria-disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:hover:bg-primary"
					>
						Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default FileUploadDialog;
