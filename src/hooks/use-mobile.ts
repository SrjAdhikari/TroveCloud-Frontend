//* src/hooks/use-mobile.ts

import * as React from "react";

const MOBILE_BREAKPOINT = 1024;

const isNarrowViewport = () => window.innerWidth < MOBILE_BREAKPOINT;

/**
 * Starts with the real screen width. shadcn's version started empty, which
 * showed the desktop layout for a moment on phones.
 */
const useIsMobile = () => {
	const [isMobile, setIsMobile] = React.useState(isNarrowViewport);

	React.useEffect(() => {
		const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
		const onChange = () => setIsMobile(isNarrowViewport());

		mql.addEventListener("change", onChange);
		return () => mql.removeEventListener("change", onChange);
	}, []);

	return isMobile;
};

export default useIsMobile;
