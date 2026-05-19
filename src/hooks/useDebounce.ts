//* src/hooks/useDebounce.ts

import { useEffect, useState } from "react";

/**
 * Returns `value` debounced by `delayMs`. The debounced value updates
 * only after the input has been stable for `delayMs` continuous ms.
 */
const useDebounce = <T>(value: T, delayMs: number): T => {
	const [debounced, setDebounced] = useState(value);

	useEffect(() => {
		const id = setTimeout(() => setDebounced(value), delayMs);
		return () => clearTimeout(id);
	}, [value, delayMs]);

	return debounced;
};

export default useDebounce;
