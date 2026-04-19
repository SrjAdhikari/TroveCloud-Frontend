//* src/components/dashboard/directory/DirectorySection.tsx

import type { ReactNode } from "react";

interface DirectorySectionProps {
	title: string;
	view: "grid" | "list";
	children: ReactNode;
}

/** CSS class for the grid/list container */
const getContainerClass = (view: "grid" | "list") =>
	view === "grid"
		? "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
		: "rounded-xl border border-border bg-card divide-y divide-border";

/**
 * Reusable section for displaying a group of items (folders or files)
 * with a title and a grid/list container layout.
 */
const DirectorySection = ({ title, view, children }: DirectorySectionProps) => {
	return (
		<section>
			<h2 className="mb-3 text-sm font-medium text-muted-foreground">
				{title}
			</h2>

			<div className={getContainerClass(view)}>
				{children}
			</div>
		</section>
	);
};

export default DirectorySection;
