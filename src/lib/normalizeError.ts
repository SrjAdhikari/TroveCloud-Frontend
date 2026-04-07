//* src/lib/normalizeError.ts

import { AxiosError } from "axios";
import type { ApiError, ApiErrorResponse } from "@/types/api.types";

/**
 * Extracts a consistent error object from an Axios error.
 * If the backend returned a structured error response, pulls out the code and message.
 * Falls back to a generic message for network failures or unexpected shapes.
 */
const normalizeError = (error: unknown): ApiError => {
	if (error instanceof AxiosError && error.response) {
		const data = error.response.data as ApiErrorResponse;

		if (data?.error?.message) {
			return {
				code: data.error.code,
				message: data.error.message,
			};
		}
	}

	return {
		code: "NETWORK_ERROR",
		message: "Something went wrong. Please try again.",
	};
};

export default normalizeError;
