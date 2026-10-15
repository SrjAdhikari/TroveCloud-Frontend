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
 * Icon and bar color for each storage category. We pick these here and ignore
 * the `icon` the server sends. Unknown categories use the `Other` entry.
 */
export const STORAGE_CATEGORY_META: Record<StorageCategory, CategoryMeta> = {
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

/** Percent of storage used, as a whole number from 0 to 100. */
export const getUsagePercent = (used: number, total: number): number => {
	if (!Number.isFinite(total) || total <= 0) return 0;

	const percent = Math.round((used / total) * 100);
	return Math.min(100, Math.max(0, percent));
};

/**
 * Color for the main usage bar: normal below 75%, warning from 75%, and
 * danger from 90%. (`danger` shows a status; `destructive` is for actions.)
 */
export const getUsageBarColor = (percent: number): string => {
	if (percent >= 90) return "bg-danger";
	if (percent >= 75) return "bg-warning";
	return "bg-primary";
};

/**
 * Turns the server's breakdown into rows for the screen. Each bar's width is
 * its share of the used space, so together they fill the used part.
 */
export const buildBreakdown = (usage: StorageUsage): BreakdownRow[] => {
	const { used, breakdown } = usage;

	return breakdown.map((item) => {
		const meta =
			STORAGE_CATEGORY_META[item.category] ?? STORAGE_CATEGORY_META.Other;
		const rawWidthPercent = used > 0 ? Math.round((item.size / used) * 100) : 0;
		const widthPercent = Math.min(100, rawWidthPercent);

		return {
			label: item.category,
			size: formatBytes(item.size),
			widthPercent,
			icon: meta.icon,
			barColor: meta.barColor,
		};
	});
};

interface QuotaCheck {
	blocked: boolean;
	remaining: number;
}

/** Checks if an upload would go over the user's storage limit. */
export const checkUploadQuota = (
	incomingBytes: number,
	usage: StorageUsage | undefined,
): QuotaCheck => {
	if (
		!usage ||
		!Number.isFinite(usage.used) ||
		!Number.isFinite(usage.total)
	) {
		return { blocked: false, remaining: 0 };
	}

	const remaining = Math.max(0, usage.total - usage.used);
	return { blocked: incomingBytes > remaining, remaining };
};
