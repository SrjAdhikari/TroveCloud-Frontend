//* src/lib/storage.ts

import {
	FileText,
	Image,
	Video,
	Music,
	Archive,
	File,
	type LucideIcon,
} from "lucide-react";
import { formatBytes } from "@/lib/formatters";
import type { StorageCategory, StorageUsage } from "@/types/storage.types";

interface CategoryMeta {
	icon: LucideIcon;
	barColor: string;
}

/**
 * Per-category icon + bar-color token. The API's `icon` string is unused — the
 * FE owns presentation (color isn't in the payload). Unknown / future
 * categories fall back to the neutral `Other` entry.
 */
const STORAGE_CATEGORY_META: Record<StorageCategory, CategoryMeta> = {
	Documents: { icon: FileText, barColor: "bg-chart-4" },
	Images: { icon: Image, barColor: "bg-chart-2" },
	Videos: { icon: Video, barColor: "bg-chart-1" },
	Audio: { icon: Music, barColor: "bg-chart-3" },
	Archives: { icon: Archive, barColor: "bg-chart-5" },
	Other: { icon: File, barColor: "bg-muted-foreground" },
};

interface BreakdownRow {
	label: string;
	size: string;
	widthPercent: number;
	icon: LucideIcon;
	barColor: string;
}

/** Used/total as a whole-number percent, clamped to 0–100. */
const getUsagePercent = (used: number, total: number): number => {
	if (!Number.isFinite(total) || total <= 0) return 0;

	const percent = Math.round((used / total) * 100);
	return Math.min(100, Math.max(0, percent));
};

/**
 * Bar-color token for the main usage bar, escalating with fill level:
 * brand `primary` below 75%, `warning` from 75%, `danger` from 90%.
 * `danger` (not `destructive`) — this is a status, not a destructive action.
 */
const getUsageBarColor = (percent: number): string => {
	if (percent >= 90) return "bg-danger";
	if (percent >= 75) return "bg-warning";
	return "bg-primary";
};

/**
 * Maps the API breakdown into render-ready rows. Bar widths are relative to
 * `used` so the category bars compose the used portion.
 */
const buildBreakdown = (usage: StorageUsage): BreakdownRow[] => {
	const { used, breakdown } = usage;

	return breakdown.map((item) => {
		const meta =
			STORAGE_CATEGORY_META[item.category] ?? STORAGE_CATEGORY_META.Other;
		const widthPercent = used > 0 ? Math.round((item.size / used) * 100) : 0;

		return {
			label: item.category,
			size: formatBytes(item.size),
			widthPercent,
			icon: meta.icon,
			barColor: meta.barColor,
		};
	});
};

export {
	getUsagePercent,
	getUsageBarColor,
	buildBreakdown,
	STORAGE_CATEGORY_META,
};
