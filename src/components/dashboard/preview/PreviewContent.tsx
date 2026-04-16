//* src/components/dashboard/preview/PreviewContent.tsx

import { FileQuestion } from "lucide-react";

import { getFilePreviewUrl, getPreviewType } from "@/lib/filePreview";
import { getFileIcon } from "@/lib/iconMapper";
import type { FileItemPayload } from "@/types/directory.types";
import TextPreview from "@/components/dashboard/preview/TextPreview";

interface PreviewContentProps {
	file: FileItemPayload;
}

/**
 * Renders the appropriate preview element based on the file type.
 * Supports images, PDFs, videos, audio, and text/code files.
 * Shows a fallback for unsupported types.
 */
const PreviewContent = ({ file }: PreviewContentProps) => {
	const previewUrl = getFilePreviewUrl(file._id);
	const previewType = getPreviewType(file.extension);

	switch (previewType) {
		case "image":
			return (
				<img
					src={previewUrl}
					alt={file.name}
					className="max-h-[55vh] sm:max-h-[65vh] lg:max-h-[75vh] w-full rounded-md object-contain"
				/>
			);

		case "pdf":
			return (
				<iframe
					src={previewUrl}
					title={file.name}
					className="h-[55vh] sm:h-[65vh] lg:h-[75vh] w-full rounded-md border border-border"
				/>
			);

		case "video":
			return (
				<video
					src={previewUrl}
					controls
					className="max-h-[55vh] sm:max-h-[65vh] lg:max-h-[75vh] w-full rounded-md"
				/>
			);

		case "audio":
			return (
				<audio src={previewUrl} controls className="w-full" />
			);

		case "text":
			return <TextPreview url={previewUrl} />;

		default: {
			const { icon: Icon, color, src } = getFileIcon(file.extension);
			return (
				<div className="flex flex-col items-center gap-5 py-8">
					<div className="flex size-16 items-center justify-center">
						{src ? (
							<img src={src} alt="" className="size-16" />
						) : (
							<Icon className={`size-10 ${color}`} />
						)}
					</div>

					<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
						<FileQuestion className="size-4" />
						Preview not available for this file type
					</div>
				</div>
			);
		}
	}
};

export default PreviewContent;
