//* src/components/dashboard/dialogs/UploadDialog.tsx

import { useRef, useState } from "react";
import { Upload } from "lucide-react";

import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_LABEL } from "@/lib/constants";
import useFileSelection from "@/hooks/useFileSelection";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import AlertBanner from "@/components/ui/alert-banner";
import SelectedFileList from "@/components/dashboard/dialogs/SelectedFileList";

interface UploadDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onUpload: (files: FileList) => void;
}

/** Splits files into ones that fit the per-file cap and ones that exceed it. */
const splitFilesBySize = (files: File[]) => {
	const allowed: File[] = [];
	const oversized: File[] = [];

	files.forEach((file) => {
		if (file.size > MAX_FILE_SIZE_BYTES) oversized.push(file);
		else allowed.push(file);
	});

	return { allowed, oversized };
};

/**
 * Custom upload dialog with drag-and-drop zone and file preview list.
 * Replaces the native file picker with a more polished experience.
 * Selected files are passed to the parent's onUpload callback on confirm.
 */
const UploadDialog = ({ open, onOpenChange, onUpload }: UploadDialogProps) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [oversizedNames, setOversizedNames] = useState<string[]>([]);
	const { selectedFiles, addFiles, removeFile, reset, totalSize } =
		useFileSelection();

	/** Resets the dialog state when closing */
	const handleOpenChange = (value: boolean) => {
		if (!value) {
			reset();
			setIsDragging(false);
			setOversizedNames([]);
		}
		onOpenChange(value);
	};

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
			acceptFiles(e.dataTransfer.files);
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			acceptFiles(e.target.files);
		}
		e.target.value = "";
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-lg bg-background gap-0 p-0 top-[50%] max-h-[90vh] flex flex-col">
				<DialogHeader className="p-5">
					<DialogTitle>Upload Files</DialogTitle>
					<DialogDescription>
						Drag and drop files or browse to select.
					</DialogDescription>
				</DialogHeader>

				<Separator />

				<div className="flex-1 overflow-y-auto space-y-4 p-5">
					{/* Drop zone */}
					<button
						type="button"
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
						className={`flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
							isDragging
								? "bg-muted/20"
								: "border-border hover:border-muted-foreground/40"
						}`}
					>
						<div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
							<Upload aria-hidden="true" className="size-6 text-primary" />
						</div>

						<div className="text-center">
							<p className="text-sm font-medium">
								{isDragging
									? "Drop files here"
									: "Click to browse or drag files here"}
							</p>

							<p className="mt-1 text-xs text-muted-foreground">
								Max file size: {MAX_FILE_SIZE_LABEL}
							</p>
						</div>
					</button>

					{/* Hidden file input */}
					<input
						ref={fileInputRef}
						type="file"
						multiple
						onChange={handleFileChange}
						className="hidden"
					/>

					{/* Oversized rejection notice */}
					{oversizedNames.length > 0 && (
						<AlertBanner variant="error">
							{oversizedNames.length === 1 ? (
								<p>
									<span className="font-medium">{oversizedNames[0]}</span>{" "}
									exceeds the {MAX_FILE_SIZE_LABEL} size limit.
								</p>
							) : (
								<>
									<p className="font-medium">
										{oversizedNames.length} files exceed the{" "}
										{MAX_FILE_SIZE_LABEL} size limit:
									</p>

									<ul className="mt-1 space-y-0.5 text-xs">
										{oversizedNames.map((name, index) => (
											<li key={`${name}-${index}`} className="truncate">
												{name}
											</li>
										))}
									</ul>
								</>
							)}
						</AlertBanner>
					)}

					{/* Selected files list */}
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
