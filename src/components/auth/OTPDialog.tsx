//* src/components/auth/OTPDialog.tsx

import { useState, useEffect } from "react";
import { toast } from "sonner";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { useVerifyOTP, useResendOTP } from "@/hooks/useAuth";

const COOLDOWN_SECONDS = 60;

interface OTPDialogProps {
	open: boolean;
	email: string;
	onSuccess: () => void; // callback after successful verification
	onBack: () => void; // callback to close the dialog
}

/**
 * Dialog for entering the 6-digit OTP sent to the user's email after registration.
 * Includes a resend button with 60-second cooldown and a back link.
 */
const OTPDialog = ({ open, email, onSuccess, onBack }: OTPDialogProps) => {
	const [otp, setOtp] = useState("");
	const [hasError, setHasError] = useState(false);
	const [cooldown, setCooldown] = useState(COOLDOWN_SECONDS);

	const { mutate: verify, isPending: isVerifying } = useVerifyOTP();
	const { mutate: resend, isPending: isResending } = useResendOTP();

	/**
	 * Countdown timer for resend cooldown — starts immediately when dialog opens
	 */
	useEffect(() => {
		if (!open || cooldown <= 0) return;

		const timer = setInterval(() => {
			setCooldown((prev) => prev - 1);
		}, 1000);

		return () => clearInterval(timer);
	}, [open, cooldown]);

	/**
	 * Reset state when dialog opens
	 */
	useEffect(() => {
		if (open) {
			setOtp("");
			setHasError(false);
			setCooldown(COOLDOWN_SECONDS);
		}
	}, [open]);

	/**
	 * Verify the OTP code — called automatically when 6 digits are entered
	 */
	const handleVerify = (code: string) => {
		if (code.length !== 6 || isVerifying) return;

		verify(
			{ email, otp: code },
			{
				onSuccess: (res) => {
					toast.success(res.message || "Email verified successfully");
					onSuccess();
				},
				onError: (error) => {
					toast.error(error.message);
					setHasError(true);
				},
			},
		);
	};

	/**
	 * Update OTP state and auto-submit when all 6 digits are entered
	 */
	const handleChange = (value: string) => {
		setOtp(value);
		if (hasError) setHasError(false);
		if (!hasError) handleVerify(value);
	};

	const handleResend = () => {
		if (cooldown > 0 || isResending) return;

		resend(
			{ email },
			{
				onSuccess: (res) => {
					toast.success(res.message || "OTP resent successfully");
					setCooldown(COOLDOWN_SECONDS);
					setOtp("");
				},
				onError: (error) => {
					toast.error(error.message);
				},
			},
		);
	};

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && onBack()}>
			<DialogContent
				className="sm:max-w-md"
				onInteractOutside={(e) => e.preventDefault()}
			>
				<DialogHeader className="space-y-2 text-center">
					<DialogTitle className="font-heading text-2xl font-bold">
						Verify Your Email
					</DialogTitle>

					<DialogDescription>
						We&apos;ve sent a 6-digit verification code to <br />
						<span className="font-medium text-foreground ml-1">{email}</span>
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col items-center gap-6 py-4">
					{/* OTP Input */}
					<InputOTP
						maxLength={6}
						value={otp}
						onChange={handleChange}
						containerClassName="gap-3"
					>
						{Array.from({ length: 6 }, (_, i) => (
							<InputOTPGroup key={i}>
								<InputOTPSlot
									index={i}
									className="size-12 text-lg"
									aria-invalid={hasError}
								/>
							</InputOTPGroup>
						))}
					</InputOTP>

					{/* Verify button */}
					<Button
						variant={"default"}
						className="w-[calc(6*3rem+5*0.75rem)] cursor-pointer disabled:pointer-events-auto disabled:cursor-not-allowed"
						disabled={otp.length !== 6 || isVerifying}
						onClick={() => handleVerify(otp)}
					>
						{isVerifying ? "Verifying..." : "Verify"}
					</Button>

					{/* Resend + Back links */}
					<div className="space-y-1 text-center">
						<p className="text-sm text-muted-foreground">
							Didn&apos;t receive the code?{" "}
							<button
								type="button"
								onClick={handleResend}
								disabled={cooldown > 0 || isResending}
								className="font-medium text-primary hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed cursor-pointer"
							>
								{cooldown > 0 ? `Resend in ${cooldown}s` : "Click to resend"}
							</button>
						</p>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default OTPDialog;
