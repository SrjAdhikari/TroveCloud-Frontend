//* src/components/dashboard/upload/SelectedFileList.tsx

import { File as FileIcon, X } from "lucide-react";
import { formatFileSize } from "@/lib/formatters";

interface SelectedFileListProps {
	files: File[];
	totalSize: number;
	onRemove: (index: number) => void;
}

/**
 * Displays the list of files selected for upload with individual
 * remove buttons. Shows total count and combined file size.
 */
const SelectedFileList = ({
	files,
	totalSize,
	onRemove,
}: SelectedFileListProps) => {
	if (files.length === 0) return null;

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<p className="text-sm font-medium">
					{files.length} {files.length === 1 ? "file" : "files"} selected
				</p>

				<p className="text-xs text-muted-foreground">
					{formatFileSize(totalSize)}
				</p>
			</div>

			<div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border p-2">
				{files.map((file, index) => (
					<div
						key={`${file.name}-${file.size}`}
						className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-accent/50"
					>
						<div className="flex items-center gap-2 min-w-0 flex-1">
							<FileIcon className="size-4 shrink-0 text-muted-foreground" />
							<span className="truncate text-sm">{file.name}</span>
						</div>

						<div className="flex items-center gap-2 shrink-0 ml-2">
							<span className="text-xs text-muted-foreground">
								{formatFileSize(file.size)}
							</span>

							<button
								type="button"
								onClick={() => onRemove(index)}
								aria-label={`Remove ${file.name}`}
								className="rounded-md p-0.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
							>
								<X aria-hidden="true" className="size-3.5" />
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default SelectedFileList;
