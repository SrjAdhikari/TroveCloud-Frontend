//* src/components/auth/ForgotPasswordDialog.tsx

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormField from "@/components/form/FormField";
import AlertBanner from "@/components/ui/alert-banner";
import OTPField from "@/components/auth/OTPField";

import useOTPResend from "@/hooks/useOTPResend";
import { useForgotPassword, useResetPassword } from "@/hooks/useAuth";

import {
	resetPasswordSchema,
	type ResetPasswordFormData,
} from "@/schemas/auth.schema";

const OTP_ERROR_MESSAGES: Record<string, string> = {
	INVALID_OTP: "Invalid verification code. Please try again.",
	OTP_EXPIRED: "The verification code has expired. Please request a new one.",
};

interface ForgotPasswordDialogProps {
	email: string;
	onSuccess: () => void;
	onBack: () => void;
}

/**
 * Two-step dialog that completes the forgot-password flow.
 *
 * Step 1 — collect the 6-digit OTP that was sent to the user's email.
 * Step 2 — collect the new password and submit {email, otp, newPassword}
 * to /auth/reset-password atomically.
 *
 * The OTP is not server-validated until Step 2 submits, so an INVALID_OTP /
 * OTP_EXPIRED response sends the user back to Step 1 with the password
 * fields preserved (avoiding a full re-entry).
 *
 * Resend re-fires /auth/forgot-password — the same endpoint as the initial
 * request — relying on the backend's 60-second OTP_COOLDOWN guardrail.
 */
const ForgotPasswordDialog = ({
	email,
	onSuccess,
	onBack,
}: ForgotPasswordDialogProps) => {
	const [step, setStep] = useState<"otp" | "password">("otp");
	const [otp, setOtp] = useState("");
	const [otpError, setOtpError] = useState<string | null>(null);
	const [formError, setFormError] = useState<string | null>(null);

	const forgotPasswordMutation = useForgotPassword();
	const { mutate: resetPassword, isPending: isResetting } = useResetPassword();

	const { cooldown, isResending, resend } = useOTPResend({
		email,
		mutation: forgotPasswordMutation,
		onResendSuccess: () => {
			setOtp("");
			setOtpError(null);
		},
		onResendError: setOtpError,
	});

	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<ResetPasswordFormData>({
		mode: "onChange",
		resolver: zodResolver(resetPasswordSchema),
	});

	/**
	 * Handles the change event of the OTP input field.
	 */
	const handleChange = (value: string) => {
		setOtp(value);
		if (otpError) setOtpError(null);
	};

	/**
	 * Handles the continue button click event.
	 */
	const handleContinue = () => {
		if (otp.length !== 6) return;
		setOtpError(null);
		setFormError(null);
		setStep("password");
	};

	const onSubmitPassword = (data: ResetPasswordFormData) => {
		setFormError(null);

		resetPassword(
			{ email, otp, newPassword: data.newPassword },
			{
				onSuccess: () => {
					onSuccess();
				},
				onError: (error) => {
					const message = OTP_ERROR_MESSAGES[error.code];
					if (message) {
						setStep("otp");
						setOtp("");
						setOtpError(message);
						return;
					}
					setFormError("Couldn't reset account password. Please try again.");
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
						{step === "otp" ? "Enter Verification Code" : "Reset Your Password"}
					</DialogTitle>

					<DialogDescription>
						{step === "otp" ? (
							<>
								Enter the 6-digit code we sent to <br />
								<span className="font-medium text-foreground ml-1">
									{email}
								</span>
							</>
						) : (
							"Choose a strong password you haven't used before."
						)}
					</DialogDescription>
				</DialogHeader>

				{step === "otp" ? (
					<div className="flex flex-col items-center gap-6 py-4">
						<OTPField
							value={otp}
							onChange={handleChange}
							errorMessage={otpError}
						/>

						<Button
							variant="default"
							type="button"
							className="w-[calc(6*3rem+5*0.75rem)] cursor-pointer disabled:pointer-events-auto disabled:cursor-not-allowed"
							disabled={otp.length !== 6}
							onClick={handleContinue}
						>
							Continue
						</Button>

						<div className="text-center text-sm text-muted-foreground">
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
										: "Click to resend"}
							</button>
						</div>
					</div>
				) : (
					<form
						onSubmit={handleSubmit(onSubmitPassword)}
						className="space-y-5 py-2"
					>
						{formError && (
							<AlertBanner variant="error">{formError}</AlertBanner>
						)}

						<FormField
							label="New Password"
							id="newPassword"
							type="password"
							autoComplete="new-password"
							placeholder="Enter your new password"
							error={errors.newPassword?.message}
							{...register("newPassword")}
						/>

						<FormField
							label="Confirm New Password"
							id="confirmPassword"
							type="password"
							autoComplete="new-password"
							placeholder="Re-enter your new password"
							error={errors.confirmPassword?.message}
							{...register("confirmPassword")}
						/>

						<Button
							type="submit"
							className="w-full h-11 cursor-pointer disabled:pointer-events-auto disabled:cursor-not-allowed disabled:hover:bg-primary"
							disabled={!isValid || isResetting}
						>
							<span className="text-base font-medium">
								{isResetting ? "Resetting..." : "Reset Password"}
							</span>
						</Button>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default ForgotPasswordDialog;
