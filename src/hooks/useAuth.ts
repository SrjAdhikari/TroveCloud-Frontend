//* src/hooks/useAuth.ts

import { useMutation, useQuery } from "@tanstack/react-query";
import {
	getCurrentUser,
	register,
	verifyOTP,
	resendOTP,
	login,
	logout,
	logoutAll,
} from "@/api/auth.api";

/**
 * Query hook for fetching the current authenticated user.
 * Used by auth guards to determine if the user is logged in.
 */
const useCurrentUser = () => {
	return useQuery({
		queryKey: ["currentUser"],
		queryFn: getCurrentUser,
		retry: false,
		staleTime: Infinity,
	});
};

/**
 * Mutation hook for user registration.
 */
const useRegister = () => {
	return useMutation({ mutationFn: register });
};

/**
 * Mutation hook for OTP verification during registration.
 */
const useVerifyOTP = () => {
	return useMutation({ mutationFn: verifyOTP });
};

/**
 * Mutation hook for resending OTP to an unverified user.
 */
const useResendOTP = () => {
	return useMutation({ mutationFn: resendOTP });
};

/**
 * Mutation hook for user login.
 */
const useLogin = () => {
	return useMutation({ mutationFn: login });
};

/**
 * Mutation hook for logging out the current session.
 */
const useLogout = () => {
	return useMutation({ mutationFn: logout });
};

/**
 * Mutation hook for logging out all sessions across all devices.
 */
const useLogoutAll = () => {
	return useMutation({ mutationFn: logoutAll });
};

export {
	useCurrentUser,
	useRegister,
	useVerifyOTP,
	useResendOTP,
	useLogin,
	useLogout,
	useLogoutAll,
};
