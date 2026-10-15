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

import type { DirectoryCrumbPayload } from "@/types/directory.types";

// The path from the top folder to the current one, which is the last item.
interface BreadcrumbsProps {
	breadcrumb: DirectoryCrumbPayload[];
}

// Above this many items, the middle folders are replaced with "…".
const TRUNCATE_THRESHOLD = 5;

const Breadcrumbs = ({ breadcrumb }: BreadcrumbsProps) => {
	if (breadcrumb.length === 0) return null;

	const current = breadcrumb[breadcrumb.length - 1];

	// Folders between the top folder and the current one.
	const middle = breadcrumb.slice(1, -1);
	const isLong = breadcrumb.length > TRUNCATE_THRESHOLD;
	const visibleMiddle = isLong ? middle.slice(-2) : middle;

	// At the top level, show "My Files" instead of the folder's real name
	// (which looks like "root-<email>").
	const isRootOnly = breadcrumb.length === 1;

	// Only link back to the top folder when we're not already there.
	const hasRoot = !isRootOnly;

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

				{visibleMiddle.map((crumb) => (
					<Fragment key={crumb._id}>
						<BreadcrumbItem>
							<BreadcrumbLink asChild>
								<Link to={`/my-files?dir=${crumb._id}`}>{crumb.name}</Link>
							</BreadcrumbLink>
						</BreadcrumbItem>

						<BreadcrumbSeparator />
					</Fragment>
				))}

				<BreadcrumbItem>
					<BreadcrumbPage>
						{isRootOnly ? "My Files" : current.name}
					</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	);
};

export default Breadcrumbs;
