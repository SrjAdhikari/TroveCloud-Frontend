//* src/routes/AppRoutes.tsx

import { Routes, Route } from "react-router";

import GuestRoute from "@/routes/GuestRoute";
import ProtectedRoute from "@/routes/ProtectedRoute";
import AdminRoute from "@/routes/AdminRoute";
import ROUTES from "@/routes/paths";
import AuthLayout from "@/components/layout/AuthLayout";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AdminLayout from "@/components/layout/AdminLayout";

import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import GitHubCallbackPage from "@/pages/GitHubCallbackPage";
import DashboardPage from "@/pages/DashboardPage";
import SettingsPage from "@/pages/SettingsPage";
import AdminOverviewPage from "@/pages/AdminOverviewPage";
import AdminUsersPage from "@/pages/AdminUsersPage";
import AdminUserDetailPage from "@/pages/AdminUserDetailPage";

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
					<Route
						path={ROUTES.FORGOT_PASSWORD}
						element={<ForgotPasswordPage />}
					/>
				</Route>
			</Route>

			{/* OAuth callback — must process the auth code regardless of current
			    auth state, so it lives outside GuestRoute (which would otherwise
			    redirect already-authenticated users away before the code is used). */}
			<Route element={<AuthLayout />}>
				<Route path={ROUTES.GITHUB_CALLBACK} element={<GitHubCallbackPage />} />
			</Route>

			{/* Protected routes — accessible only when logged in */}
			<Route element={<ProtectedRoute />}>
				<Route element={<DashboardLayout />}>
					<Route path={ROUTES.MY_FILES} element={<DashboardPage />} />
					<Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
				</Route>

				{/* Admin routes — separate layout */}
				<Route element={<AdminRoute />}>
					<Route element={<AdminLayout />}>
						<Route
							path={ROUTES.ADMIN_OVERVIEW}
							element={<AdminOverviewPage />}
						/>
						<Route path={ROUTES.ADMIN_USERS} element={<AdminUsersPage />} />
						<Route
							path={ROUTES.ADMIN_USER_DETAIL}
							element={<AdminUserDetailPage />}
						/>
					</Route>
				</Route>
			</Route>
		</Routes>
	);
};

export default AppRoutes;
