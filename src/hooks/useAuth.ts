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

export const useCurrentUser = () => {
	return useQuery({
		queryKey: ["currentUser"],
		queryFn: getCurrentUser,
		retry: false,
		staleTime: CURRENT_USER_STALE_TIME,
	});
};

export const useRegister = () => {
	return useMutation({ mutationFn: register });
};

export const useVerifyOTP = () => {
	return useMutation({ mutationFn: verifyOTP });
};

export const useResendOTP = () => {
	return useMutation({ mutationFn: resendOTP });
};

export const useLogin = () => {
	return useMutation({ mutationFn: login });
};

export const useForgotPassword = () => {
	return useMutation({ mutationFn: forgotPassword });
};

export const useResetPassword = () => {
	return useMutation({ mutationFn: resetPassword });
};

export const useChangePassword = () => {
	return useMutation({ mutationFn: changePassword });
};

export const useGoogleSignIn = () => {
	return useMutation({ mutationFn: signInWithGoogle });
};

export const useGitHubSignIn = () => {
	return useMutation({ mutationFn: signInWithGitHub });
};

export const useLogout = () => {
	return useMutation({ mutationFn: logout });
};

export const useLogoutAll = () => {
	return useMutation({ mutationFn: logoutAll });
};
