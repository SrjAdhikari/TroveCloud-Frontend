//* src/components/dashboard/upload/FileUploadProgress.tsx

import { X } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { UploadItem } from "@/hooks/useFileUpload";

interface FileUploadProgressProps {
	uploads: UploadItem[];
	onDismiss: (id: string) => void;
	onCancel: (id: string) => void;
}

/** Status label shown below the file name for completed/failed uploads */
const StatusLabel = ({
	status,
	errorMessage,
}: Pick<UploadItem, "status" | "errorMessage">) => {
	if (status === "success")
		return <p className="text-xs text-success mt-1">Completed</p>;

	if (status === "error")
		return (
			<p className="text-xs text-destructive mt-1">
				{errorMessage || "Failed to upload"}
			</p>
		);

	return null;
};

/**
 * Fixed bottom-right panel showing upload progress for each file.
 * Auto-hides when there are no uploads to show.
 */
const FileUploadProgress = ({
	uploads,
	onDismiss,
	onCancel,
}: FileUploadProgressProps) => {
	if (uploads.length === 0) return null;

	return (
		<div className="fixed bottom-6 right-6 z-50 w-80 rounded-xl bg-card shadow-lg">
			<div className="px-4 pt-4 pb-2">
				<h3 className="font-heading font-medium">In Progress</h3>
			</div>

			<div className="max-h-64 overflow-y-auto px-3 pb-3 space-y-2">
				{uploads.map((upload) => (
					<div key={upload.id} className="rounded-lg border border-border bg-background p-3">
						{/* File name + close button */}
						<div className="flex items-center gap-2">
							<p className="truncate text-sm font-medium min-w-0 flex-1">
								{upload.fileName}
							</p>

							<Button
								variant="ghost"
								size="icon"
								onClick={() =>
									upload.status === "uploading"
										? onCancel(upload.id)
										: onDismiss(upload.id)
								}
								aria-label={
									upload.status === "uploading"
										? `Cancel upload of ${upload.fileName}`
										: `Dismiss ${upload.fileName}`
								}
								className={`size-5 shrink-0 cursor-pointer ${
									upload.status === "uploading"
										? "text-destructive hover:text-destructive"
										: ""
								}`}
							>
								<X aria-hidden="true" className="size-3.5" />
							</Button>
						</div>

						{/* Progress bar (only while uploading) */}
						{upload.status === "uploading" && (
							<div className="flex items-center gap-2 mt-2">
								<Progress
									value={upload.progress}
									className="h-1.5 flex-1 *:data-[slot=progress-indicator]:bg-primary"
								/>
								<span className="text-xs text-muted-foreground w-9 text-right">
									{upload.progress}%
								</span>
							</div>
						)}

						<StatusLabel
							status={upload.status}
							errorMessage={upload.errorMessage}
						/>
					</div>
				))}
			</div>
		</div>
	);
};

export default FileUploadProgress;
