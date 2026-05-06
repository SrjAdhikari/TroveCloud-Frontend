//* src/components/dashboard/dialogs/FilePreviewDialog.tsx

import { Download } from "lucide-react";

import { getPreviewType } from "@/lib/filePreview";
import cn from "@/lib/utils";
import type { FileItemPayload } from "@/types/directory.types";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import PreviewContent from "@/components/dashboard/preview/PreviewContent";

interface FilePreviewDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	file: FileItemPayload;
	onDownload: () => void;
}

/**
 * Dialog for previewing files inline within the app.
 * Renders images, PDFs, videos, and audio natively.
 * Includes a download button and shows a fallback for unsupported types.
 */
const FilePreviewDialog = ({
	open,
	onOpenChange,
	file,
	onDownload,
}: FilePreviewDialogProps) => {
	const previewType = getPreviewType(file.extension);
	const isUnsupported = previewType === "unsupported";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				showCloseButton={false}
				className={cn(
					"gap-4 bg-background p-5",
					isUnsupported
						? "top-[40%] min-w-sm max-w-sm sm:max-w-sm max-sm:min-w-[calc(100%-2rem)]"
						: "top-1/2 max-w-[90vw] sm:max-w-xl lg:max-w-3xl xl:max-w-4xl",
				)}
			>
				<DialogHeader className="flex-row items-center justify-between gap-2">
					<div className="min-w-0">
						<DialogTitle className="truncate text-sm font-medium">
							{file.name}
						</DialogTitle>

						<DialogDescription className="text-xs">
							{file.extension.replace(".", "").toUpperCase()} file
						</DialogDescription>
					</div>

					<Button
						variant="outline"
						size="sm"
						onClick={onDownload}
						className="shrink-0 cursor-pointer gap-1.5"
					>
						<Download className="size-3.5" />
						Download
					</Button>
				</DialogHeader>

				<PreviewContent file={file} />
			</DialogContent>
		</Dialog>
	);
};

export default FilePreviewDialog;
