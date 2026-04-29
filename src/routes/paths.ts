//* src/routes/paths.ts

/**
 * Centralized route paths.
 */
const ROUTES = {
	ROOT: "/",
	CREATE_ACCOUNT: "/create-account",
	FORGOT_PASSWORD: "/forgot-password",
	GITHUB_CALLBACK: "/auth/github/callback",
	MY_FILES: "/my-files",
	SETTINGS: "/settings",
} as const;

export default ROUTES;
