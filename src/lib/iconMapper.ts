//* src/lib/iconMapper.ts

import {
	File,
	FileText,
	FileImage,
	FileVideo,
	FileAudio,
	FileArchive,
	FileCode,
	FileSpreadsheet,
	Folder,
	Image,
	Video,
	Music,
	Download,
	Archive,
	Code,
	Gamepad2,
	type LucideIcon,
} from "lucide-react";

// ─── File Icons ──────────────────────────────────────────────

interface FileIconEntry {
	icon: LucideIcon;
	color: string;
}

/** Maps file extensions to lucide icons and colors, grouped by category */
const FILE_ICON_MAP: Record<string, FileIconEntry> = {
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

const DEFAULT_FILE_ICON: FileIconEntry = {
	icon: File,
	color: "text-muted-foreground",
};

/**
 * Returns the icon and color for a file based on its extension.
 * Falls back to a generic file icon for unknown extensions.
 */
const getFileIcon = (extension: string): FileIconEntry => {
	const ext = extension.toLowerCase().replace(".", "");
	return FILE_ICON_MAP[ext] ?? DEFAULT_FILE_ICON;
};

// ─── Folder Icons ────────────────────────────────────────────

interface FolderIconEntry {
	icon: LucideIcon;
	color: string;
	bg: string;
}

/** Maps common folder names to specific icons and colors */
const FOLDER_ICON_MAP: {
	keywords: string[];
	icon: LucideIcon;
	color: string;
	bg: string;
}[] = [
	{
		keywords: [
			"image",
			"images",
			"photo",
			"photos",
			"picture",
			"pictures",
			"screenshot",
			"screenshots",
		],
		icon: Image,
		color: "text-pink-500",
		bg: "bg-pink-500/10",
	},
	{
		keywords: ["video", "videos", "movie", "movies", "recording", "recordings"],
		icon: Video,
		color: "text-purple-500",
		bg: "bg-purple-500/10",
	},
	{
		keywords: ["music", "audio", "song", "songs", "podcast", "podcasts"],
		icon: Music,
		color: "text-orange-500",
		bg: "bg-orange-500/10",
	},
	{
		keywords: [
			"document",
			"documents",
			"docs",
			"report",
			"reports",
			"note",
			"notes",
		],
		icon: FileText,
		color: "text-indigo-500",
		bg: "bg-indigo-500/10",
	},
	{
		keywords: ["download", "downloads"],
		icon: Download,
		color: "text-green-500",
		bg: "bg-green-500/10",
	},
	{
		keywords: ["archive", "archives", "backup", "backups", "zip"],
		icon: Archive,
		color: "text-amber-500",
		bg: "bg-amber-500/10",
	},
	{
		keywords: ["code", "project", "projects", "dev", "source", "src"],
		icon: Code,
		color: "text-cyan-500",
		bg: "bg-cyan-500/10",
	},
	{
		keywords: ["game", "games", "gaming"],
		icon: Gamepad2,
		color: "text-violet-500",
		bg: "bg-violet-500/10",
	},
];

const DEFAULT_FOLDER_ICON: FolderIconEntry = {
	icon: Folder,
	color: "text-blue-500",
	bg: "bg-blue-500/10",
};

/**
 * Returns the icon, color, and background for a folder based on its name.
 * Matches folder name (case-insensitive) against known keywords.
 */
const getFolderIcon = (name: string): FolderIconEntry => {
	const lower = name.toLowerCase();
	const match = FOLDER_ICON_MAP.find((entry) =>
		entry.keywords.some((keyword) => lower === keyword),
	);
	return match ?? DEFAULT_FOLDER_ICON;
};

export { getFileIcon, getFolderIcon };
