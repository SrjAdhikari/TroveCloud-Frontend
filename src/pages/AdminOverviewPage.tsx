//* src/pages/AdminOverviewPage.tsx

import { useSystemOverview } from "@/hooks/useAdmin";

import OverviewLoadFailed from "@/components/admin/OverviewLoadFailed";
import OverviewStats from "@/components/admin/OverviewStats";
import LoadingSpinner from "@/components/ui/loading-spinner";

/** Admin home page: site-wide totals (users, storage, sign-ups, sessions). */
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
