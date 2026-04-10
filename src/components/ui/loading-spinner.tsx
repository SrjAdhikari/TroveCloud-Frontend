//* src/components/ui/loading-spinner.tsx

import { LoaderIcon } from "lucide-react";
import cn from "@/lib/utils";

interface LoadingSpinnerProps {
	className?: string;
	fullScreen?: boolean;
}

/**
 * Reusable loading spinner with optional full-screen centered layout.
 * Uses Lucide's LoaderIcon icon with CSS spin animation.
 */
const LoadingSpinner = ({
	className,
	fullScreen = false,
}: LoadingSpinnerProps) => {
	const spinner = (
		<LoaderIcon className={cn("size-6 animate-spin text-primary", className)} />
	);

	if (fullScreen) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center gap-2">
				{spinner}
				<span className="text-base font-medium text-muted-foreground">
					Loading...
				</span>
			</div>
		);
	}

	return spinner;
};

export default LoadingSpinner;
