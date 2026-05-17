//* src/pages/AdminOverviewPage.tsx

import { useSystemOverview } from "@/hooks/useAdmin";

import AdminTabs from "@/components/admin/AdminTabs";
import OverviewLoadFailed from "@/components/admin/OverviewLoadFailed";
import OverviewStats from "@/components/admin/OverviewStats";
import LoadingSpinner from "@/components/ui/loading-spinner";

/**
 * Admin console landing page — fetches point-in-time system aggregates
 * (users, roles, storage, signups, sessions) and renders them as a card grid.
 */
const AdminOverviewPage = () => {
	const { data, isLoading, error } = useSystemOverview();

	if (isLoading) {
		return <LoadingSpinner fullScreen />;
	}

	if (error) {
		return <OverviewLoadFailed error={error} />;
	}

	return (
		<div className="-m-6">
			<div className="space-y-2 border-b px-3 py-2 sm:px-6">
				<h1 className="text-xl font-medium md:text-2xl">
					Admin Console Overview
				</h1>
				<AdminTabs />
			</div>

			<div className="space-y-6 p-6">
				{data?.data ? <OverviewStats overview={data.data} /> : null}
			</div>
		</div>
	);
};

export default AdminOverviewPage;
