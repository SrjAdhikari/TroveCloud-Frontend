//* src/hooks/useOTPResend.ts

import { useEffect, useState } from "react";
import type { UseMutationResult } from "@tanstack/react-query";

import type { ApiError, ApiSuccessResponse } from "@/types/api.types";

const DEFAULT_COOLDOWN_SECONDS = 60;

interface UseOTPResendOptions {
	email: string;
	mutation: UseMutationResult<ApiSuccessResponse, ApiError, { email: string }>;
	onResendSuccess: () => void;
	onResendError: (message: string) => void;
	cooldownSeconds?: number;
	initialCooldown?: number;
}

/**
 * Handles "Resend code" and its wait timer for both OTP dialogs (sign-up and
 * password reset). The dialog keeps the code and error text; this hook reports
 * back through `onResendSuccess` / `onResendError`.
 */
const useOTPResend = ({
	email,
	mutation,
	onResendSuccess,
	onResendError,
	cooldownSeconds = DEFAULT_COOLDOWN_SECONDS,
	initialCooldown = cooldownSeconds,
}: UseOTPResendOptions) => {
	const [cooldown, setCooldown] = useState(initialCooldown);

	useEffect(() => {
		if (cooldown <= 0) return;
		const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
		return () => clearInterval(timer);
	}, [cooldown]);

	const resend = () => {
		if (cooldown > 0 || mutation.isPending) return;

		mutation.mutate(
			{ email },
			{
				onSuccess: () => {
					setCooldown(cooldownSeconds);
					onResendSuccess();
				},
				onError: (error) => {
					onResendError(
						error.code === "OTP_COOLDOWN"
							? "Please wait a moment before requesting another code."
							: "Couldn't resend the code. Please try again.",
					);
				},
			},
		);
	};

	return {
		cooldown,
		isResending: mutation.isPending,
		resend,
	};
};

export default useOTPResend;
