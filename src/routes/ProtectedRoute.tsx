//* src/routes/ProtectedRoute.tsx

import { Navigate, Outlet } from "react-router";
import { useCurrentUser } from "@/hooks/useAuth";
import ROUTES from "@/routes/paths";
import LoadingSpinner from "@/components/ui/loading-spinner";

/**
 * For signed-in pages. Signed-out users go to sign-in. Shows a spinner
 * while checking.
 */
const ProtectedRoute = () => {
	const { data, isLoading } = useCurrentUser();

	if (isLoading) return <LoadingSpinner fullScreen />;
	if (!data) return <Navigate to={ROUTES.ROOT} replace />;

	return <Outlet />;
};

export default ProtectedRoute;
