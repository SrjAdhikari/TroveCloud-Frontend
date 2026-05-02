//* src/components/dashboard/directory/Breadcrumbs.tsx

import { Fragment } from "react";
import { Link } from "react-router";

import {
	Breadcrumb,
	BreadcrumbEllipsis,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import type { DirectoryAncestorPayload } from "@/types/directory.types";

interface BreadcrumbsProps {
	ancestors: DirectoryAncestorPayload[];
	currentName: string;
}

// Collapse middle ancestors into "…" when the path is deeper than this.
const TRUNCATE_THRESHOLD = 4;

const Breadcrumbs = ({ ancestors, currentName }: BreadcrumbsProps) => {
	const hasRoot = ancestors.length > 0;
	const isLong = ancestors.length > TRUNCATE_THRESHOLD;

	// Ancestors between root and current (root is always shown as "My Files").
	// When the path is long, only the last 2 are kept; the rest hide behind "…".
	const middle = ancestors.slice(1);
	const visibleMiddle = isLong ? middle.slice(-2) : middle;

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{hasRoot && (
					<>
						<BreadcrumbItem>
							<BreadcrumbLink asChild>
								<Link to="/my-files">My Files</Link>
							</BreadcrumbLink>
						</BreadcrumbItem>

						<BreadcrumbSeparator />
					</>
				)}

				{isLong && (
					<>
						<BreadcrumbItem>
							<BreadcrumbEllipsis />
						</BreadcrumbItem>

						<BreadcrumbSeparator />
					</>
				)}

				{visibleMiddle.map((ancestor) => (
					<Fragment key={ancestor._id}>
						<BreadcrumbItem>
							<BreadcrumbLink asChild>
								<Link to={`/my-files?dir=${ancestor._id}`}>
									{ancestor.name}
								</Link>
							</BreadcrumbLink>
						</BreadcrumbItem>

						<BreadcrumbSeparator />
					</Fragment>
				))}

				<BreadcrumbItem>
					<BreadcrumbPage>{currentName}</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	);
};

export default Breadcrumbs;
