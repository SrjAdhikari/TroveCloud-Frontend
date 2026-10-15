//* src/hooks/useDebounce.ts

import { useEffect, useState } from "react";

/** Returns `value` after it stops changing for `delayMs` milliseconds. */
const useDebounce = <T>(value: T, delayMs: number): T => {
	const [debounced, setDebounced] = useState(value);

	useEffect(() => {
		const id = setTimeout(() => setDebounced(value), delayMs);
		return () => clearTimeout(id);
	}, [value, delayMs]);

	return debounced;
};

export default useDebounce;
