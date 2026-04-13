//* src/components/dashboard/FileCard.tsx

import {
	File,
	FileText,
	FileImage,
	FileVideo,
	FileAudio,
	FileArchive,
	FileCode,
	FileSpreadsheet,
} from "lucide-react";

import { formatDate } from "@/lib/dateFormatters";
import type { FileItemPayload } from "@/types/directory.types";

interface FileCardProps {
	file: FileItemPayload;
}

/**
 * Maps a file extension to a lucide icon and color.
 * Groups extensions by category for a visually distinct file grid.
 */
const getFileIcon = (extension: string) => {
	const ext = extension.toLowerCase().replace(".", "");

	const iconMap: Record<string, { icon: typeof File; color: string }> = {
		// Documents
		pdf: { icon: FileText, color: "text-red-500" },
		doc: { icon: FileText, color: "text-blue-600" },
		docx: { icon: FileText, color: "text-blue-600" },
		txt: { icon: FileText, color: "text-gray-500" },
		rtf: { icon: FileText, color: "text-gray-500" },

		// Spreadsheets
		xls: { icon: FileSpreadsheet, color: "text-green-600" },
		xlsx: { icon: FileSpreadsheet, color: "text-green-600" },
		csv: { icon: FileSpreadsheet, color: "text-green-600" },

		// Images
		png: { icon: FileImage, color: "text-purple-500" },
		jpg: { icon: FileImage, color: "text-purple-500" },
		jpeg: { icon: FileImage, color: "text-purple-500" },
		gif: { icon: FileImage, color: "text-purple-500" },
		svg: { icon: FileImage, color: "text-purple-500" },
		webp: { icon: FileImage, color: "text-purple-500" },

		// Video
		mp4: { icon: FileVideo, color: "text-pink-500" },
		mov: { icon: FileVideo, color: "text-pink-500" },
		avi: { icon: FileVideo, color: "text-pink-500" },
		mkv: { icon: FileVideo, color: "text-pink-500" },

		// Audio
		mp3: { icon: FileAudio, color: "text-orange-500" },
		wav: { icon: FileAudio, color: "text-orange-500" },
		flac: { icon: FileAudio, color: "text-orange-500" },

		// Archives
		zip: { icon: FileArchive, color: "text-yellow-600" },
		rar: { icon: FileArchive, color: "text-yellow-600" },
		"7z": { icon: FileArchive, color: "text-yellow-600" },
		tar: { icon: FileArchive, color: "text-yellow-600" },
		gz: { icon: FileArchive, color: "text-yellow-600" },

		// Code
		js: { icon: FileCode, color: "text-yellow-500" },
		ts: { icon: FileCode, color: "text-blue-500" },
		jsx: { icon: FileCode, color: "text-cyan-500" },
		tsx: { icon: FileCode, color: "text-cyan-500" },
		html: { icon: FileCode, color: "text-orange-600" },
		css: { icon: FileCode, color: "text-blue-400" },
		json: { icon: FileCode, color: "text-gray-500" },
		py: { icon: FileCode, color: "text-green-500" },
	};

	return iconMap[ext] || { icon: File, color: "text-muted-foreground" };
};

/**
 * Renders a single file as a card with an icon based on its extension.
 */
const FileCard = ({ file }: FileCardProps) => {
	const { icon: Icon, color } = getFileIcon(file.extension);

	return (
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
		</div>
	);
};

export default FileCard;
