//* src/components/auth/OTPDialog.tsx

import { useState } from "react";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import OTPField from "@/components/auth/OTPField";

import useOTPResend from "@/hooks/useOTPResend";
import { useVerifyOTP, useResendOTP } from "@/hooks/useAuth";

const OTP_ERROR_MESSAGES: Record<string, string> = {
	INVALID_OTP: "Invalid verification code. Please try again.",
	OTP_EXPIRED: "The verification code has expired. Please request a new one.",
};

interface OTPDialogProps {
	email: string;
	onSuccess: () => void;
	onBack: () => void;
	initialCooldown?: number;
}

/**
 * Email-verification OTP dialog used by register (post-signup) and login
 * (when an unverified user tries to sign in). Verifies the 6-digit code via
 * the register/verify-otp endpoint; on success the parent handles the
 * post-verify flow (login: prompt re-auth; register: navigate to dashboard).
 *
 * Mounting model: parent renders this conditionally (`{showOTP && <Dialog/>}`)
 * so internal state initialises fresh on every open via `useState` defaults —
 * no reset-on-open effect needed.
 */
const OTPDialog = ({
	email,
	onSuccess,
	onBack,
	initialCooldown,
}: OTPDialogProps) => {
	const [otp, setOtp] = useState("");
	const [error, setError] = useState<string | null>(null);

	const { mutate: verify, isPending: isVerifying } = useVerifyOTP();
	const resendMutation = useResendOTP();

	const { cooldown, isResending, resend } = useOTPResend({
		email,
		mutation: resendMutation,
		onResendSuccess: () => {
			setOtp("");
			setError(null);
		},
		onResendError: setError,
		initialCooldown,
	});

	/**
	 * Update OTP state and auto-submit when all 6 digits are entered.
	 * Clears any prior error first so the retry path isn't blocked by stale
	 * state when the user starts retyping.
	 */
	const handleChange = (value: string) => {
		setOtp(value);
		if (error) setError(null);
		if (value.length === 6) handleVerify(value);
	};

	/**
	 * Verify the OTP code. Maps backend error codes to inline messages —
	 * never toasts auth failures (per `reference_feedback_patterns.md`).
	 */
	const handleVerify = (code: string) => {
		if (code.length !== 6 || isVerifying) return;

		verify(
			{ email, otp: code },
			{
				onSuccess: () => {
					onSuccess();
				},
				onError: (error) => {
					const message = OTP_ERROR_MESSAGES[error.code];
					if (message) {
						setOtp("");
						setError(message);
						return;
					}
					setError("Couldn't verify the code. Please try again.");
				},
			},
		);
	};

	return (
		<Dialog open onOpenChange={(isOpen) => !isOpen && onBack()}>
			<DialogContent
				className="sm:max-w-md"
				onInteractOutside={(e) => e.preventDefault()}
			>
				<DialogHeader className="space-y-2 text-center">
					<DialogTitle className="font-heading text-2xl font-bold">
						Verify your email
					</DialogTitle>

					<DialogDescription>
						We&apos;ve sent a 6-digit verification code to <br />
						<span className="font-medium text-foreground ml-1">{email}</span>
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col items-center gap-6 py-4">
					<OTPField
						value={otp}
						onChange={handleChange}
						errorMessage={error}
						disabled={isVerifying}
						autoFocus
					/>

					<Button
						variant="default"
						type="button"
						className="w-[calc(6*3rem+5*0.75rem)] cursor-pointer disabled:pointer-events-auto disabled:cursor-not-allowed"
						disabled={otp.length !== 6 || isVerifying}
						onClick={() => handleVerify(otp)}
					>
						{isVerifying ? "Verifying..." : "Verify Email"}
					</Button>

					<p className="text-center text-sm text-muted-foreground">
						Didn&apos;t receive the code?{" "}
						<button
							type="button"
							onClick={resend}
							disabled={cooldown > 0 || isResending}
							className="font-medium text-primary hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed cursor-pointer"
						>
							{cooldown > 0
								? `Resend in ${cooldown}s`
								: isResending
									? "Sending..."
									: "Resend code"}
						</button>
					</p>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default OTPDialog;
