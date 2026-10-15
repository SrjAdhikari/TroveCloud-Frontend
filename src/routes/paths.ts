//* src/routes/paths.ts

/** All route paths in one place. */
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

export const adminUserDetailPath = (id: string) => `/admin/users/${id}`;

export default ROUTES;
