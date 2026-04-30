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
	GoogleSignInPayload,
	GitHubSignInPayload,
} from "@/types/auth.types";

/**
 * Fetches the currently authenticated user's profile.
 */
const getCurrentUser = async () => {
	const { data } =
		await axiosClient.get<ApiSuccessResponse<UserPayload>>("/auth/me");
	return data;
};

/**
 * Registers a new user and triggers an OTP email.
 * If the email already exists but is unverified, the backend re-sends the OTP.
 */
const register = async (payload: RegisterPayload) => {
	const { data } = await axiosClient.post<ApiSuccessResponse>(
		"/auth/register",
		payload,
	);
	return data;
};

/**
 * Verifies the 6-digit OTP sent to the user's email during registration.
 */
const verifyOTP = async (payload: VerifyOTPPayload) => {
	const { data } = await axiosClient.post<ApiSuccessResponse>(
		"/auth/register/verify-otp",
		payload,
	);
	return data;
};

/**
 * Resends the OTP to an unverified user's email.
 */
const resendOTP = async (payload: ResendOTPPayload) => {
	const { data } = await axiosClient.post<ApiSuccessResponse>(
		"/auth/register/resend-otp",
		payload,
	);
	return data;
};

/**
 * Logs in a user with email and password.
 */
const login = async (payload: LoginPayload) => {
	const { data } = await axiosClient.post<ApiSuccessResponse>(
		"/auth/login",
		payload,
	);
	return data;
};

/**
 * Sends a password-reset OTP to the user's email.
 */
const forgotPassword = async (payload: ForgotPasswordPayload) => {
	const { data } = await axiosClient.post<ApiSuccessResponse>(
		"/auth/forgot-password",
		payload,
	);
	return data;
};

/**
 * Resets the user's password by verifying the OTP and
 * updating the password in a single atomic call.
 */
const resetPassword = async (payload: ResetPasswordPayload) => {
	const { data } = await axiosClient.post<ApiSuccessResponse>(
		"/auth/reset-password",
		payload,
	);
	return data;
};

/**
 * Signs in (or signs up) a user using a Google ID token.
 */
const signInWithGoogle = async (payload: GoogleSignInPayload) => {
	const { data } = await axiosClient.post<ApiSuccessResponse>(
		"/auth/google",
		payload,
	);
	return data;
};

/**
 * Signs in (or signs up) a user using a GitHub authorization code.
 */
const signInWithGitHub = async (payload: GitHubSignInPayload) => {
	const { data } = await axiosClient.post<ApiSuccessResponse>(
		"/auth/github",
		payload,
	);
	return data;
};

/**
 * Logs out the current session by clearing the cookie and deleting the session.
 */
const logout = async () => {
	const { data } = await axiosClient.post<ApiSuccessResponse>("/auth/logout");
	return data;
};

/**
 * Logs out all sessions across all devices for the current user.
 */
const logoutAll = async () => {
	const { data } =
		await axiosClient.post<ApiSuccessResponse>("/auth/logout-all");
	return data;
};

export {
	getCurrentUser,
	register,
	verifyOTP,
	resendOTP,
	login,
	forgotPassword,
	resetPassword,
	signInWithGoogle,
	signInWithGitHub,
	logout,
	logoutAll,
};
