//* src/routes/AppRoutes.tsx

import { Routes, Route } from "react-router";

import GuestRoute from "@/routes/GuestRoute";
import ProtectedRoute from "@/routes/ProtectedRoute";
import AuthLayout from "@/components/layout/AuthLayout";
import DashboardLayout from "@/components/layout/DashboardLayout";

import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import DashboardPage from "@/pages/DashboardPage";
import SettingsPage from "@/pages/SettingsPage";

/**
 * Central route definitions for the app.
 * Guest routes (auth pages) redirect to /my-files if already logged in.
 * Protected routes redirect to /login if not authenticated.
 */
const AppRoutes = () => {
	return (
		<Routes>
			{/* Guest routes — accessible only when NOT logged in */}
			<Route element={<GuestRoute />}>
				<Route element={<AuthLayout />}>
					<Route path="/login" element={<LoginPage />} />
					<Route path="/register" element={<RegisterPage />} />
					<Route path="/forgot-password" element={<ForgotPasswordPage />} />
				</Route>
			</Route>

			{/* Protected routes — accessible only when logged in */}
			<Route element={<ProtectedRoute />}>
				<Route element={<DashboardLayout />}>
					<Route path="/my-files" element={<DashboardPage />} />
					<Route path="/settings" element={<SettingsPage />} />
				</Route>
			</Route>
		</Routes>
	);
};

export default AppRoutes;
