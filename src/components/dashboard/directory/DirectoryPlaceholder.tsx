//* src/components/dashboard/directory/DirectoryPlaceholder.tsx

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface DirectoryPlaceholderProps {
	icon: LucideIcon;
	title: string;
	description: ReactNode;
	children?: ReactNode;
}

/**
 * Shared layout for full-page directory placeholders (empty state, no
 * search results, load-error). Renders an icon-in-frame visual with a
 * heading + description, and an optional CTA slot below.
 */
const DirectoryPlaceholder = ({
	icon: Icon,
	title,
	description,
	children,
}: DirectoryPlaceholderProps) => {
	return (
		<div className="flex min-h-[calc(100svh-11rem)] items-center justify-center text-muted-foreground py-10">
			<div className="flex flex-col items-center gap-6">
				<div className="rounded-3xl bg-primary/5 p-6">
					<Icon
						aria-hidden="true"
						className="size-14 md:size-16 text-primary"
						strokeWidth={1}
					/>
				</div>

				<div className="text-center">
					<h2 className="text-lg md:text-xl font-medium text-foreground">
						{title}
					</h2>
					<p className="mt-1 text-sm">{description}</p>
				</div>

				{children}
			</div>
		</div>
	);
};

export default DirectoryPlaceholder;
