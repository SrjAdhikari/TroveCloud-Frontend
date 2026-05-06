//* src/components/icons/DriveIcon.tsx

import type { SVGProps } from "react";

/**
 * Google Drive brand icon.
 */
const DriveIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox="0 0 48 48"
		fill="none"
		stroke="currentColor"
		strokeWidth="3"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
		{...props}
	>
		<path d="M18.15,7.11,4.5,30.75l5.85,10.14h27.3L43.5,30.75,29.85,7.11Z" />
		<line x1="4.5" y1="30.75" x2="31.79" y2="30.75" />
		<line x1="37.65" y1="40.89" x2="24" y2="17.25" />
		<line x1="29.85" y1="7.11" x2="16.21" y2="30.75" />
	</svg>
);

export default DriveIcon;
