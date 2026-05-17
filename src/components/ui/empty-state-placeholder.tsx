//* src/components/ui/empty-state-placeholder.tsx

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStatePlaceholderProps {
	icon: LucideIcon;
	title: string;
	description: ReactNode;
	children?: ReactNode;
}

/**
 * Shared layout for full-page empty-state placeholders (no-data, no-search-
 * results, load-error, access-denied, etc.). Renders an icon-in-frame visual
 * with a heading + description, and an optional CTA slot below.
 */
const EmptyStatePlaceholder = ({
	icon: Icon,
	title,
	description,
	children,
}: EmptyStatePlaceholderProps) => {
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

export default EmptyStatePlaceholder;
