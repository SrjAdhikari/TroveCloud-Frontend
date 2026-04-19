//* src/components/dashboard/dialogs/UploadDialog.tsx

import { useRef, useState } from "react";
import { Upload, FileUp } from "lucide-react";

import useFileSelection from "@/hooks/useFileSelection";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import SelectedFileList from "@/components/dashboard/dialogs/SelectedFileList";

interface UploadDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onUpload: (files: FileList) => void;
}

/**
 * Custom upload dialog with drag-and-drop zone and file preview list.
 * Replaces the native file picker with a more polished experience.
 * Selected files are passed to the parent's onUpload callback on confirm.
 */
const UploadDialog = ({ open, onOpenChange, onUpload }: UploadDialogProps) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const { selectedFiles, addFiles, removeFile, reset, totalSize } =
		useFileSelection();

	/** Resets the dialog state when closing */
	const handleOpenChange = (value: boolean) => {
		if (!value) {
			reset();
			setIsDragging(false);
		}
		onOpenChange(value);
	};

	/** Converts the File[] back to a FileList-like object and triggers upload */
	const handleUpload = () => {
		if (selectedFiles.length === 0) return;

		const dataTransfer = new DataTransfer();
		selectedFiles.forEach((file) => dataTransfer.items.add(file));
		onUpload(dataTransfer.files);
		handleOpenChange(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		if (e.dataTransfer.files.length > 0) {
			addFiles(e.dataTransfer.files);
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			addFiles(e.target.files);
		}
		e.target.value = "";
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Upload className="size-5" />
						Upload Files
					</DialogTitle>

					<DialogDescription>
						Drag and drop files or browse to select.
					</DialogDescription>
				</DialogHeader>

				{/* Drop zone */}
				<div
					onDragOver={(e) => {
						e.preventDefault();
						setIsDragging(true);
					}}
					onDragLeave={(e) => {
						e.preventDefault();
						setIsDragging(false);
					}}
					onDrop={handleDrop}
					onClick={() => fileInputRef.current?.click()}
					className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-colors ${
						isDragging
							? "border-blue-500 bg-blue-500/10"
							: "border-border hover:border-muted-foreground/40 hover:bg-accent/30"
					}`}
				>
					<div className="flex size-12 items-center justify-center rounded-full bg-muted">
						<FileUp className="size-6 text-muted-foreground" />
					</div>

					<div className="text-center">
						<p className="text-sm font-medium">
							{isDragging
								? "Drop files here"
								: "Click to browse or drag files here"}
						</p>

						<p className="mt-1 text-xs text-muted-foreground">
							Upload multiple files at once
						</p>
					</div>
				</div>

				{/* Hidden file input */}
				<input
					ref={fileInputRef}
					type="file"
					multiple
					onChange={handleFileChange}
					className="hidden"
				/>

				{/* Selected files list */}
				<SelectedFileList
					files={selectedFiles}
					totalSize={totalSize}
					onRemove={removeFile}
				/>

				{/* Actions */}
				<div className="flex justify-end gap-2 pt-2">
					<Button
						variant="outline"
						onClick={() => handleOpenChange(false)}
						className="cursor-pointer"
					>
						Cancel
					</Button>

					<Button
						onClick={handleUpload}
						disabled={selectedFiles.length === 0}
						className="cursor-pointer"
					>
						Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default UploadDialog;
