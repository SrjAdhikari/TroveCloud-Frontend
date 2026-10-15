//* src/lib/formatters.ts

/** Short date, e.g. "2026-04-12T10:30:00Z" → "Apr 12, 2026". */
export const formatDate = (dateStr: string) => {
	return new Date(dateStr).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
};

/** Readable file size, e.g. 2048 → "2.0 KB", 1_000_000_000 → "1 GB". */
export const formatBytes = (bytes: number): string => {
	if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

	const units = ["B", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(1000));
	const size = bytes / Math.pow(1000, i);

	return `${size % 1 === 0 ? size : size.toFixed(1)} ${units[i]}`;
};

/** Date with time, e.g. "2026-04-12T10:30:00Z" → "Apr 12, 2026, 10:30 AM". */
export const formatDateTime = (dateStr: string) => {
	return new Date(dateStr).toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
};

/** Adds thousands separators, e.g. 1247 → "1,247". */
export const formatNumber = (n: number) => n.toLocaleString();

/** Adds an "s" when count isn't 1, e.g. (3, "file") → "3 files". */
export const pluralize = (count: number, word: string) =>
	`${count} ${count === 1 ? word : `${word}s`}`;
