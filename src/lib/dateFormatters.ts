//* src/lib/dateFormatters.ts

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

export { formatDate };
