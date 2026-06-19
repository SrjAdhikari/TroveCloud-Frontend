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

// Root → current folder, self-inclusive (last crumb = the folder you're in).
interface BreadcrumbsProps {
	breadcrumb: DirectoryCrumbPayload[];
}

// Collapse intermediate crumbs into "…" once the trail
// (root + middle + current) is deeper than this many entries.
const TRUNCATE_THRESHOLD = 5;

const Breadcrumbs = ({ breadcrumb }: BreadcrumbsProps) => {
	if (breadcrumb.length === 0) return null;

	const current = breadcrumb[breadcrumb.length - 1];

	// Folders strictly between root and current.
	const middle = breadcrumb.slice(1, -1);
	const isLong = breadcrumb.length > TRUNCATE_THRESHOLD;
	const visibleMiddle = isLong ? middle.slice(-2) : middle;

	// At root the only crumb is the root folder itself; label it "My Files"
	// rather than leaking the raw root name (e.g. "root-<email>").
	const isRootOnly = breadcrumb.length === 1;

	// Only show the root link crumb when we aren't already at root.
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
