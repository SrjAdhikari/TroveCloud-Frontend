//* src/routes/GuestRoute.tsx

import { Navigate, Outlet } from "react-router";
import { useCurrentUser } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/ui/loading-spinner";

/**
 * Route guard for unauthenticated users (login, register, etc.).
 * Redirects to /my-files if already authenticated.
 * Shows a full-screen spinner while the auth check is in progress.
 */
const GuestRoute = () => {
	const { data, isLoading } = useCurrentUser();

	if (isLoading) return <LoadingSpinner fullScreen />;
	if (data) return <Navigate to="/my-files" replace />;

	return <Outlet />;
};

export default GuestRoute;
