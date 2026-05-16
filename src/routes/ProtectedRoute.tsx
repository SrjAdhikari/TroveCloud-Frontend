//* src/routes/ProtectedRoute.tsx

import { Navigate, Outlet } from "react-router";
import { useCurrentUser } from "@/hooks/useAuth";
import ROUTES from "@/routes/paths";
import LoadingSpinner from "@/components/ui/loading-spinner";

/**
 * Route guard for authenticated users.
 * Renders child routes if authenticated, redirects to / (sign in) otherwise.
 * Shows a full-screen spinner while the auth check is in progress.
 */
const ProtectedRoute = () => {
	const { data, isLoading, isError } = useCurrentUser();

	if (isLoading) return <LoadingSpinner fullScreen />;
	if (isError || !data) return <Navigate to={ROUTES.ROOT} replace />;

	return <Outlet />;
};

export default ProtectedRoute;
