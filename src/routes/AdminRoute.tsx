//* src/routes/AdminRoute.tsx

import { Navigate, Outlet } from "react-router";
import { useCurrentUser } from "@/hooks/useAuth";
import ROUTES from "@/routes/paths";
import isAdminRole from "@/lib/role";
import LoadingSpinner from "@/components/ui/loading-spinner";

/**
 * Route guard for admin-only pages.
 * Redirects unauthenticated visitors to the sign-in page and plain users to /my-files.
 */
const AdminRoute = () => {
	const { data, isLoading, isError } = useCurrentUser();

	if (isLoading) return <LoadingSpinner fullScreen />;
	if (isError || !data) return <Navigate to={ROUTES.ROOT} replace />;

	if (!isAdminRole(data.data.role)) {
		return <Navigate to={ROUTES.MY_FILES} replace />;
	}

	return <Outlet />;
};

export default AdminRoute;
