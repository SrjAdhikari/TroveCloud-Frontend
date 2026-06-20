//* src/components/dashboard/directory/DirectoryGridView.tsx

import type { ReactNode } from "react";

interface DirectoryGridViewProps {
	title: string;
	children: ReactNode;
}

/**
 * Directory Grid View component
 *
 * @param title - Title of the directory
 * @param children - Child components (folders or files)
 * @returns Directory Grid View component
 */
const DirectoryGridView = ({ title, children }: DirectoryGridViewProps) => {
	return (
		<section>
			<h2 className="mb-3 text-sm font-medium text-muted-foreground">
				{title}
			</h2>

			<div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3">
				{children}
			</div>
		</section>
	);
};

export default DirectoryGridView;
