//* src/lib/formatters.ts

/**
 * Formats an ISO date string into a short readable format.
 * e.g., "2026-04-12T10:30:00Z" → "Apr 12, 2026"
 */
const formatDate = (dateStr: string) => {
	return new Date(dateStr).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
};

/**
 * Formats a byte count into a human-readable size string
 * e.g., 2048 → "2.0 KB", 1_000_000_000 → "1 GB"
 */
const formatBytes = (bytes: number): string => {
	if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

	const units = ["B", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(1000));
	const size = bytes / Math.pow(1000, i);

	return `${size % 1 === 0 ? size : size.toFixed(1)} ${units[i]}`;
};

/**
 * Formats an ISO date string into a readable format with time.
 * e.g., "2026-04-12T10:30:00Z" → "Apr 12, 2026, 10:30 AM"
 */
const formatDateTime = (dateStr: string) => {
	return new Date(dateStr).toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
};

/**
 * Formats an integer with locale-aware thousands separators.
 * e.g., 1247 → "1,247", 1000000 → "1,000,000"
 */
const formatNumber = (n: number) => n.toLocaleString();

/**
 * Returns "<count> <word>" with the word pluralized when count is not 1.
 * e.g., pluralize(1, "file") → "1 file", pluralize(3, "file") → "3 files"
 */
const pluralize = (count: number, word: string) =>
	`${count} ${count === 1 ? word : `${word}s`}`;

export {
	formatDate,
	formatBytes,
	formatDateTime,
	formatNumber,
	pluralize,
};
