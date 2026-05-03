//* src/lib/iconMapper.ts

import {
	Folder,
	FileText,
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
	color: string;
	src: string;
}

/** Base path for custom file-type SVG icons */
const ICON_BASE = "/assets/icons";

/** Maps file extensions to custom SVG icons, grouped by category */
const FILE_ICON_MAP: Record<string, FileIconEntry> = {
	// Documents
	pdf: { color: "text-red-500", src: `${ICON_BASE}/pdf.svg` },
	doc: { color: "text-blue-600", src: `${ICON_BASE}/doc.svg` },
	docx: { color: "text-blue-600", src: `${ICON_BASE}/doc.svg` },
	txt: { color: "text-gray-500", src: `${ICON_BASE}/txt.svg` },
	md: { color: "text-gray-500", src: `${ICON_BASE}/md.svg` },
	rtf: { color: "text-gray-500", src: `${ICON_BASE}/rtf.svg` },
	ppt: { color: "text-orange-500", src: `${ICON_BASE}/ppt.svg` },
	pptx: { color: "text-orange-500", src: `${ICON_BASE}/ppt.svg` },

	// Spreadsheets
	xls: { color: "text-green-600", src: `${ICON_BASE}/xls.svg` },
	xlsx: { color: "text-green-600", src: `${ICON_BASE}/xls.svg` },
	csv: { color: "text-green-600", src: `${ICON_BASE}/csv.svg` },

	// Images
	png: { color: "text-purple-500", src: `${ICON_BASE}/png.svg` },
	jpg: { color: "text-purple-500", src: `${ICON_BASE}/jpg.svg` },
	jpeg: { color: "text-purple-500", src: `${ICON_BASE}/jpg.svg` },
	gif: { color: "text-purple-500", src: `${ICON_BASE}/gif.svg` },
	svg: { color: "text-purple-500", src: `${ICON_BASE}/svg.svg` },
	webp: { color: "text-purple-500", src: `${ICON_BASE}/webp.svg` },

	// Video
	mp4: { color: "text-pink-500", src: `${ICON_BASE}/mp4.svg` },
	mov: { color: "text-pink-500", src: `${ICON_BASE}/mov.svg` },
	avi: { color: "text-pink-500", src: `${ICON_BASE}/avi.svg` },
	mkv: { color: "text-pink-500", src: `${ICON_BASE}/mkv.svg` },

	// Audio
	mp3: { color: "text-orange-500", src: `${ICON_BASE}/mp3.svg` },
	wav: { color: "text-orange-500", src: `${ICON_BASE}/wav.svg` },
	flac: { color: "text-orange-500", src: `${ICON_BASE}/flac.svg` },

	// Archives
	zip: { color: "text-yellow-600", src: `${ICON_BASE}/zip.svg` },
	rar: { color: "text-yellow-600", src: `${ICON_BASE}/rar.svg` },
	"7z": { color: "text-yellow-600", src: `${ICON_BASE}/7z.svg` },

	// Code & Config
	js: { color: "text-yellow-500", src: `${ICON_BASE}/js.svg` },
	ts: { color: "text-blue-500", src: `${ICON_BASE}/ts.svg` },
	html: { color: "text-orange-600", src: `${ICON_BASE}/html.svg` },
	css: { color: "text-blue-400", src: `${ICON_BASE}/css.svg` },
	json: { color: "text-gray-500", src: `${ICON_BASE}/json.svg` },
	py: { color: "text-green-500", src: `${ICON_BASE}/py.svg` },
	sql: { color: "text-blue-500", src: `${ICON_BASE}/sql.svg` },

	// Executables
	exe: { color: "text-gray-600", src: `${ICON_BASE}/exe.svg` },
};

const DEFAULT_FILE_ICON: FileIconEntry = {
	color: "text-muted-foreground",
	src: `${ICON_BASE}/file.svg`,
};

/**
 * Returns the color and custom SVG path for a file based on its extension.
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
