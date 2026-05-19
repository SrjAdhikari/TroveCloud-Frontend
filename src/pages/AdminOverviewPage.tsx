//* src/pages/AdminOverviewPage.tsx

import { useSystemOverview } from "@/hooks/useAdmin";

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

	return data?.data ? <OverviewStats overview={data.data} /> : null;
};

export default AdminOverviewPage;
