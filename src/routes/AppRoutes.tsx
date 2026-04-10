//* src/routes/AppRoutes.tsx

import { Routes, Route, Navigate } from "react-router";

import GuestRoute from "@/routes/GuestRoute";
import ProtectedRoute from "@/routes/ProtectedRoute";
import AuthLayout from "@/components/layout/AuthLayout";

import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";

/**
 * Central route definitions for the app.
 * Guest routes (auth pages) redirect to dashboard if already logged in.
 * Protected routes redirect to login if not authenticated.
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

			{/* Root redirect */}
			<Route path="/" element={<Navigate to="/login" replace />} />

			{/* Protected routes — accessible only when logged in */}
			<Route element={<ProtectedRoute />}>
				<Route path="/dashboard" element={<div>Dashboard</div>} />
			</Route>
		</Routes>
	);
};

export default AppRoutes;
