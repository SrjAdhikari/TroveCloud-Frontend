//* src/routes/AppRoutes.tsx

import { Routes, Route } from "react-router";

import GuestRoute from "@/routes/GuestRoute";
import ProtectedRoute from "@/routes/ProtectedRoute";
import ROUTES from "@/routes/paths";
import AuthLayout from "@/components/layout/AuthLayout";
import DashboardLayout from "@/components/layout/DashboardLayout";

import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import GitHubCallbackPage from "@/pages/GitHubCallbackPage";
import DashboardPage from "@/pages/DashboardPage";
import SettingsPage from "@/pages/SettingsPage";

/**
 * Central route definitions for the app.
 * Guest routes (auth pages) redirect to /my-files if already logged in.
 * Protected routes redirect to / (sign in) if not authenticated.
 */
const AppRoutes = () => {
	return (
		<Routes>
			{/* Guest routes — accessible only when NOT logged in */}
			<Route element={<GuestRoute />}>
				<Route element={<AuthLayout />}>
					<Route path={ROUTES.ROOT} element={<LoginPage />} />
					<Route path={ROUTES.CREATE_ACCOUNT} element={<RegisterPage />} />
					<Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
					<Route path={ROUTES.GITHUB_CALLBACK} element={<GitHubCallbackPage />} />
				</Route>
			</Route>

			{/* Protected routes — accessible only when logged in */}
			<Route element={<ProtectedRoute />}>
				<Route element={<DashboardLayout />}>
					<Route path={ROUTES.MY_FILES} element={<DashboardPage />} />
					<Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
				</Route>
			</Route>
		</Routes>
	);
};

export default AppRoutes;
