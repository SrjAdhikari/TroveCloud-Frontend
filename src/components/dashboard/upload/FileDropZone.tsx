//* src/components/dashboard/upload/FileDropZone.tsx

import { useRef, useState } from "react";
import { Upload } from "lucide-react";

import { MAX_FILE_SIZE_LABEL } from "@/lib/constants";

interface FileDropZoneProps {
	onFiles: (files: FileList | File[]) => void;
}

/**
 * Click-to-browse + drag-and-drop file picker. Owns its own drag highlight
 * state and the hidden <input type="file">; the parent only receives the
 * raw file list via onFiles.
 */
const FileDropZone = ({ onFiles }: FileDropZoneProps) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = useState(false);

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);

		if (e.dataTransfer.files.length > 0) {
			onFiles(e.dataTransfer.files);
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			onFiles(e.target.files);
		}
		e.target.value = "";
	};

	return (
		<>
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

			<input
				ref={fileInputRef}
				type="file"
				multiple
				onChange={handleFileChange}
				className="hidden"
				aria-label="Select files to upload"
			/>
		</>
	);
};

export default FileDropZone;
