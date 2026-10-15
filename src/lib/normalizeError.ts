//* src/lib/normalizeError.ts

import { AxiosError } from "axios";
import type { ApiError, ApiErrorResponse } from "@/types/api.types";

/**
 * Turns any failed request into the same { code, message } shape. Uses the
 * server's code and message when it sent them, or a general message if not.
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
