//* src/hooks/use-mobile.ts

import * as React from "react";

const MOBILE_BREAKPOINT = 1024;

const isNarrowViewport = () => window.innerWidth < MOBILE_BREAKPOINT;

/**
 * Tracks whether the viewport is below the mobile breakpoint.
 * Seeded during the first render — shadcn's generated version started at
 * `undefined` to stay SSR-safe, which in this client-only app just meant one
 * desktop-layout frame before the effect corrected it.
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
