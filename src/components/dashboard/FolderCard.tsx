//* src/components/dashboard/FolderCard.tsx

import { useSearchParams } from "react-router";
import {
	Folder,
	Image,
	Video,
	Music,
	FileText,
	Download,
	Archive,
	Code,
	Gamepad2,
	type LucideIcon,
} from "lucide-react";

import { formatDate } from "@/lib/dateFormatters";
import type { DirectoryItemPayload } from "@/types/directory.types";

interface FolderCardProps {
	folder: DirectoryItemPayload;
}

/**
 * Maps common folder names to specific icons and colors.
 * Matches against lowercase folder name — supports partial matches.
 */
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

/** Default folder icon when no keyword matches */
const DEFAULT_FOLDER = {
	icon: Folder,
	color: "text-blue-500",
	bg: "bg-blue-500/10",
};

/**
 * Returns the icon, color, and background for a folder based on its name.
 * Matches folder name (case-insensitive) against known keywords.
 */
const getFolderIcon = (name: string) => {
	const lower = name.toLowerCase();
	const match = FOLDER_ICON_MAP.find((entry) =>
		entry.keywords.some((keyword) => lower === keyword),
	);
	return match ?? DEFAULT_FOLDER;
};

/**
 * Renders a single folder as a clickable card.
 * Clicking navigates into the folder by updating the `dir` search param.
 */
const FolderCard = ({ folder }: FolderCardProps) => {
	const [, setSearchParams] = useSearchParams();
	const { icon: Icon, color, bg } = getFolderIcon(folder.name);

	/** Navigate into this folder by setting the dir search param */
	const handleClick = () => {
		setSearchParams({ dir: folder._id });
	};

	return (
		<button
			onClick={handleClick}
			className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-accent cursor-pointer"
		>
			<div
				className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${bg}`}
			>
				<Icon className={`size-5 ${color}`} />
			</div>
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-medium">{folder.name}</p>
				<p className="text-xs text-muted-foreground">
					{formatDate(folder.updatedAt)}
				</p>
			</div>
		</button>
	);
};

export default FolderCard;
