//* src/lib/getInitials.ts

/**
 * Returns up to two uppercase initials from a user's name.
 * e.g., "Suraj Adhikari" → "SA", "suraj" → "SU"
 */
const getInitials = (name: string) => {
	const parts = name.trim().split(/\s+/);
	if (parts.length >= 2) {
		return (parts[0][0] + parts[1][0]).toUpperCase();
	}

	return name.slice(0, 2).toUpperCase();
};

export default getInitials;
