//* src/lib/getInitials.ts

/**
 * Up to two capital letters from a name.
 * e.g. "Suraj Adhikari" → "SA", "suraj" → "SU"
 */
const getInitials = (name: string) => {
	const trimmed = name.trim();
	const parts = trimmed.split(/\s+/);
	if (parts.length >= 2) {
		return (parts[0][0] + parts[1][0]).toUpperCase();
	}

	return trimmed.slice(0, 2).toUpperCase();
};

export default getInitials;
