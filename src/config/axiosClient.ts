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
 * Backend codes that mean the current session can no longer access the page
 * it's on — role revoked, account suspended, or session invalidated server-
 * side. The cached `currentUser` query is optimistic and won't reflect these
 * changes until refetched, so the interceptor evicts the user out of any
 * guarded surface (admin, dashboard) and forces a refetch.
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
 * Response interceptor — converts backend errors into a consistent { code, message }
 * shape so every catch block in the app gets the same predictable error object.
 *
 * On eviction codes, invalidate the cached `currentUser` then hard-redirect
 * to /my-files so the destination bootstraps a fresh auth state from the
 * server. Skip when already on a public path (no logged-in session to evict).
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
