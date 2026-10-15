//* src/hooks/useAuth.ts

import { useMutation, useQuery } from "@tanstack/react-query";
import {
	getCurrentUser,
	register,
	verifyOTP,
	resendOTP,
	login,
	forgotPassword,
	resetPassword,
	changePassword,
	signInWithGoogle,
	signInWithGitHub,
	logout,
	logoutAll,
} from "@/api/auth.api";

const CURRENT_USER_STALE_TIME = 45 * 60 * 1000;

/**
 * Query hook for fetching the current authenticated user.
 * Used by auth guards to determine if the user is logged in.
 */
export const useCurrentUser = () => {
	return useQuery({
		queryKey: ["currentUser"],
		queryFn: getCurrentUser,
		retry: false,
		staleTime: CURRENT_USER_STALE_TIME,
	});
};

/**
 * Mutation hook for user registration.
 */
export const useRegister = () => {
	return useMutation({ mutationFn: register });
};

/**
 * Mutation hook for OTP verification during registration.
 */
export const useVerifyOTP = () => {
	return useMutation({ mutationFn: verifyOTP });
};

/**
 * Mutation hook for resending OTP to an unverified user.
 */
export const useResendOTP = () => {
	return useMutation({ mutationFn: resendOTP });
};

/**
 * Mutation hook for user login.
 */
export const useLogin = () => {
	return useMutation({ mutationFn: login });
};

/**
 * Mutation hook for requesting a password-reset OTP.
 */
export const useForgotPassword = () => {
	return useMutation({ mutationFn: forgotPassword });
};

/**
 * Mutation hook for completing the password reset (OTP + new password).
 */
export const useResetPassword = () => {
	return useMutation({ mutationFn: resetPassword });
};

/**
 * Mutation hook for changing the signed-in user's password.
 */
export const useChangePassword = () => {
	return useMutation({ mutationFn: changePassword });
};

/**
 * Mutation hook for signing in with a Google ID token.
 */
export const useGoogleSignIn = () => {
	return useMutation({ mutationFn: signInWithGoogle });
};

/**
 * Mutation hook for signing in with a GitHub authorization code.
 */
export const useGitHubSignIn = () => {
	return useMutation({ mutationFn: signInWithGitHub });
};

/**
 * Mutation hook for logging out the current session.
 */
export const useLogout = () => {
	return useMutation({ mutationFn: logout });
};

/**
 * Mutation hook for logging out all sessions across all devices.
 */
export const useLogoutAll = () => {
	return useMutation({ mutationFn: logoutAll });
};
