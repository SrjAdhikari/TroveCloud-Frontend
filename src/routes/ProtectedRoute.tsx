//* src/routes/ProtectedRoute.tsx

import { Navigate, Outlet } from "react-router";
import { useCurrentUser } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/ui/loading-spinner";

/**
 * Route guard for authenticated users.
 * Renders child routes if authenticated, redirects to /login otherwise.
 * Shows a full-screen spinner while the auth check is in progress.
 */
const ProtectedRoute = () => {
	const { data, isLoading, isError } = useCurrentUser();

	if (isLoading) return <LoadingSpinner fullScreen />;
	if (isError || !data) return <Navigate to="/login" replace />;

	return <Outlet />;
};

export default ProtectedRoute;
