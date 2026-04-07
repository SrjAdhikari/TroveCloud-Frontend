//* src/types/api.types.ts

/**
 * Shared types for API communication.
 * These mirror the backend's response format from the global error middleware.
 */

// Shape of success responses from controllers
export interface ApiSuccessResponse<T = undefined> {
	success: true;
	message: string;
	data?: T;
}

// Shape of error responses from the global error middleware
export interface ApiErrorResponse {
	status: "fail" | "error";
	error: {
		code: string;
		message: string;
	};
}

// Normalized error shape after Axios interceptor processes it
export interface ApiError {
	message: string;
	code: string;
}
