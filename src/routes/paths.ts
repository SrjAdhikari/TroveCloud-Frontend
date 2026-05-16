//* src/routes/paths.ts

/**
 * Centralized route paths.
 */
const ROUTES = {
	ROOT: "/",

	// Public
	CREATE_ACCOUNT: "/create-account",
	FORGOT_PASSWORD: "/forgot-password",
	GITHUB_CALLBACK: "/auth/github/callback",

	// Authenticated dashboard
	MY_FILES: "/my-files",
	SETTINGS: "/settings",

	// Admin console (protected)
	ADMIN_OVERVIEW: "/admin",
	ADMIN_USERS: "/admin/users",
	ADMIN_USER_DETAIL: "/admin/users/:id",
} as const;

/**
 * Builds the concrete URL for the admin user-detail route.
 */
const adminUserDetailPath = (id: string) => `/admin/users/${id}`;

export default ROUTES;
export { adminUserDetailPath };
