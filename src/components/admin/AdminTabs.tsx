//* src/components/admin/AdminTabs.tsx

import { Link, useLocation } from "react-router";

import ROUTES from "@/routes/paths";
import cn from "@/lib/utils";

interface AdminTab {
	label: string;
	path: string;
}

const tabs: AdminTab[] = [
	{ label: "Overview", path: ROUTES.ADMIN_OVERVIEW },
	{ label: "Users", path: ROUTES.ADMIN_USERS },
];

/**
 * In-page tab strip for navigating between admin console screens.
 * Active tab is derived from `location.pathname` — exact match on the
 * Overview route so `/admin/users` doesn't light up both tabs.
 */
const AdminTabs = () => {
	const location = useLocation();

	return (
		<nav aria-label="Admin sections" className="-mb-px flex gap-1">
			{tabs.map((tab) => {
				const isActive =
					tab.path === ROUTES.ADMIN_OVERVIEW
						? location.pathname === tab.path
						: location.pathname === tab.path ||
							location.pathname.startsWith(`${tab.path}/`);

				return (
					<Link
						key={tab.path}
						to={tab.path}
						aria-current={isActive ? "page" : undefined}
						className={cn(
							"border-b-2 px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
							isActive
								? "border-primary text-foreground"
								: "border-transparent text-muted-foreground hover:text-foreground",
						)}
					>
						{tab.label}
					</Link>
				);
			})}
		</nav>
	);
};

export default AdminTabs;
