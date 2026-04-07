//* src/config/axiosClient.ts

/**
 * Central Axios instance — all API calls go through this.
 * `withCredentials: true` ensures the browser sends the signed httpOnly
 * session cookie on every request (required for cookie-based auth).
 */

import axios from "axios";
import normalizeError from "@/lib/normalizeError";
import { API_BASE_URL } from "@/lib/constants";

if (!API_BASE_URL) {
	throw new Error("VITE_API_URL is not defined in the environment variables");
}

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
 */
axiosClient.interceptors.response.use(
	(response) => response,
	(error) => Promise.reject(normalizeError(error)),
);

export default axiosClient;
