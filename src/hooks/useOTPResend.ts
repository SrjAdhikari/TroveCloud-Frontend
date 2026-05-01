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
 * Bundles the OTP-resend cooldown + mutation invocation pattern that
 * OTPDialog (register flow) and ForgotPasswordDialog (password-reset flow) both need.
 *
 * Owns:
 * - `cooldown` state and the per-second ticker (with cleanup on unmount)
 * - the resend network call, gated by `cooldown > 0 || isPending`
 * - error-code mapping for `OTP_COOLDOWN` → friendly inline message
 *
 * The parent owns the OTP value + inline error state; the hook just calls
 * back via `onResendSuccess` / `onResendError` when the network resolves.
 *
 * Cooldown starts at `initialCooldown` on mount (defaults to `cooldownSeconds`
 * for the common "parent just sent an OTP" case) and resets to
 * `cooldownSeconds` after every successful resend.
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
