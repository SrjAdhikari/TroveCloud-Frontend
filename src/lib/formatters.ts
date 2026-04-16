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
 * Formats a byte count into a human-readable file size string.
 * e.g., 1536 → "1.5 KB", 2097152 → "2 MB"
 */
const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return "0 B";

	const units = ["B", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	const size = bytes / Math.pow(1024, i);

	return `${size % 1 === 0 ? size : size.toFixed(1)} ${units[i]}`;
};

export { formatDate, formatFileSize };
