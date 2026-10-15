//* src/types/api.types.ts

/**
 * Shared types for API communication.
 * These mirror the backend's response format from the global error middleware.
 */

// Shape of every successful server response
export interface ApiSuccessResponse<T = undefined> {
	success: true;
	message: string;
	data: T;
}

// Shape of every error response from the server
export interface ApiErrorResponse {
	status: "fail" | "error";
	error: {
		code: string;
		message: string;
	};
}

// Error shape after our Axios setup cleans it up
export interface ApiError {
	message: string;
	code: string;
}
