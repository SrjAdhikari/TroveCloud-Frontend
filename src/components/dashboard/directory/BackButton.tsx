//* src/components/dashboard/directory/BackButton.tsx

import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface BackButtonProps {
	onClick: () => void;
}

/**
 * Circular back arrow button with a "Go Back" tooltip.
 * Used in directory headers to navigate to the parent folder.
 */
const BackButton = ({ onClick }: BackButtonProps) => {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="outline"
					size="icon"
					onClick={onClick}
					className="size-6 rounded-full cursor-pointer"
				>
					<ChevronLeft className="size-4" />
				</Button>
			</TooltipTrigger>
			<TooltipContent>Go Back</TooltipContent>
		</Tooltip>
	);
};

export default BackButton;
