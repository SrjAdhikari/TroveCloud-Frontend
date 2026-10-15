//* src/api/auth.api.ts

import axiosClient from "@/config/axiosClient";
import type { ApiSuccessResponse } from "@/types/api.types";
import type {
	UserPayload,
	RegisterPayload,
	LoginPayload,
	VerifyOTPPayload,
	ResendOTPPayload,
	ForgotPasswordPayload,
	ResetPasswordPayload,
	ChangePasswordPayload,
	GoogleSignInPayload,
	GitHubSignInPayload,
} from "@/types/auth.types";

export const getCurrentUser = async () => {
	const { data } =
		await axiosClient.get<ApiSuccessResponse<UserPayload>>("/auth/me");
	return data;
};

/**
 * Creates an account and emails a code. If the email is already registered
 * but not verified, the server sends a new code instead.
 */
export const register = async (payload: RegisterPayload) => {
	const { data } = await axiosClient.post<ApiSuccessResponse>(
		"/auth/register",
		payload,
	);
	return data;
};

/** Checks the 6-digit code emailed after sign-up. */
export const verifyOTP = async (payload: VerifyOTPPayload) => {
	const { data } = await axiosClient.post<ApiSuccessResponse>(
		"/auth/register/verify-otp",
		payload,
	);
	return data;
};

export const resendOTP = async (payload: ResendOTPPayload) => {
	const { data } = await axiosClient.post<ApiSuccessResponse>(
		"/auth/register/resend-otp",
		payload,
	);
	return data;
};

export const login = async (payload: LoginPayload) => {
	const { data } = await axiosClient.post<ApiSuccessResponse>(
		"/auth/login",
		payload,
	);
	return data;
};

/** Emails a code for resetting the password. */
export const forgotPassword = async (payload: ForgotPasswordPayload) => {
	const { data } = await axiosClient.post<ApiSuccessResponse>(
		"/auth/forgot-password",
		payload,
	);
	return data;
};

/** Sets a new password using the emailed code, in one step. */
export const resetPassword = async (payload: ResetPasswordPayload) => {
	const { data } = await axiosClient.post<ApiSuccessResponse>(
		"/auth/reset-password",
		payload,
	);
	return data;
};

/**
 * Changes the password. The server logs out every other device but keeps
 * this one signed in.
 */
export const changePassword = async (payload: ChangePasswordPayload) => {
	const { data } = await axiosClient.patch<ApiSuccessResponse>(
		"/auth/change-password",
		payload,
	);
	return data;
};

/** Signs in with Google, creating the account if needed. */
export const signInWithGoogle = async (payload: GoogleSignInPayload) => {
	const { data } = await axiosClient.post<ApiSuccessResponse>(
		"/auth/google",
		payload,
	);
	return data;
};

/** Signs in with GitHub, creating the account if needed. */
export const signInWithGitHub = async (payload: GitHubSignInPayload) => {
	const { data } = await axiosClient.post<ApiSuccessResponse>(
		"/auth/github",
		payload,
	);
	return data;
};

export const logout = async () => {
	const { data } = await axiosClient.post<ApiSuccessResponse>("/auth/logout");
	return data;
};

export const logoutAll = async () => {
	const { data } =
		await axiosClient.post<ApiSuccessResponse>("/auth/logout-all");
	return data;
};
