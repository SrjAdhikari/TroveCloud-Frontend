//* src/routes/GuestRoute.tsx

import { Navigate, Outlet } from "react-router";
import { useCurrentUser } from "@/hooks/useAuth";
import ROUTES from "@/routes/paths";
import LoadingSpinner from "@/components/ui/loading-spinner";

/**
 * For signed-out pages like login. Signed-in users go to /my-files. Shows a
 * spinner while checking.
 */
const GuestRoute = () => {
	const { data, isLoading } = useCurrentUser();

	if (isLoading) return <LoadingSpinner fullScreen />;
	if (data) return <Navigate to={ROUTES.MY_FILES} replace />;

	return <Outlet />;
};

export default GuestRoute;
