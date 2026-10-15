//* src/config/axiosClient.ts

/**
 * Central Axios instance — all API calls go through this.
 * `withCredentials: true` ensures the browser sends the signed httpOnly
 * session cookie on every request (required for cookie-based auth).
 */

import axios from "axios";
import normalizeError from "@/lib/normalizeError";
import { API_BASE_URL } from "@/lib/constants";
import queryClient from "@/config/queryClient";
import ROUTES from "@/routes/paths";

if (!API_BASE_URL) {
	throw new Error("VITE_API_URL is not defined in the environment variables");
}

/**
 * Error codes meaning the user can no longer see this page: their role
 * changed, their account was suspended, or their session ended. The saved
 * user data doesn't know yet, so the app reloads it and moves them out.
 */
const EVICTION_CODES = new Set([
	"INSUFFICIENT_ROLE",
	"ACCOUNT_SUSPENDED",
	"UNAUTHORIZED_ACCESS",
]);

const PUBLIC_PATHS = new Set<string>([
	ROUTES.ROOT,
	ROUTES.CREATE_ACCOUNT,
	ROUTES.FORGOT_PASSWORD,
	ROUTES.GITHUB_CALLBACK,
]);

const axiosClient = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});

/**
 * Turns every server error into the same { code, message } shape.
 * For the codes above, it clears the saved user and fully reloads /my-files
 * so the app checks again who's signed in. Skipped on public pages.
 */
axiosClient.interceptors.response.use(
	(response) => response,
	(error) => {
		const normalized = normalizeError(error);

		if (
			EVICTION_CODES.has(normalized.code) &&
			!PUBLIC_PATHS.has(window.location.pathname)
		) {
			queryClient.invalidateQueries({ queryKey: ["currentUser"] });
			window.location.href = ROUTES.MY_FILES;
		}

		return Promise.reject(normalized);
	},
);

export default axiosClient;
