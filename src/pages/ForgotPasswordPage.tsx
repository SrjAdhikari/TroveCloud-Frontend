//* src/pages/ForgotPasswordPage.tsx

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";

import FormField from "@/components/form/FormField";
import { Button } from "@/components/ui/button";
import AlertBanner from "@/components/ui/alert-banner";
import ForgotPasswordDialog from "@/components/auth/ForgotPasswordDialog";
import toast from "@/lib/toast";

import ROUTES from "@/routes/paths";
import { resendOTPSchema, type ResendOTPFormData } from "@/schemas/auth.schema";
import { useForgotPassword } from "@/hooks/useAuth";

/**
 * Asks for the email and sends a 6-digit code, then ForgotPasswordDialog
 * asks for the code and the new password. Reuses `resendOTPSchema`, since
 * it's the same single email field.
 */
const ForgotPasswordPage = () => {
	const [showDialog, setShowDialog] = useState(false);
	const [submittedEmail, setSubmittedEmail] = useState("");
	const [authError, setAuthError] = useState<{
		variant: "error" | "warning";
		message: string;
	} | null>(null);

	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { mutate, isPending } = useForgotPassword();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isValid },
	} = useForm<ResendOTPFormData>({
		mode: "onChange",
		resolver: zodResolver(resendOTPSchema),
	});

	const onSubmit = (data: ResendOTPFormData) => {
		setAuthError(null);

		mutate(data, {
			onSuccess: () => {
				setSubmittedEmail(data.email);
				setShowDialog(true);
			},
			onError: (error) => {
				if (error.code === "OTP_COOLDOWN") {
					setAuthError({
						variant: "warning",
						message: "Please wait a moment before requesting another code.",
					});
					return;
				}

				if (error.code === "PROVIDER_MISMATCH") {
					setAuthError({
						variant: "error",
						message:
							"This account uses social sign-in. Please use the original provider on the sign-in page.",
					});
					return;
				}

				if (error.code === "USER_NOT_FOUND") {
					setAuthError({
						variant: "error",
						message: "No verified account found with this email address.",
					});
					return;
				}

				if (error.code === "RATE_LIMITED") {
					setAuthError({
						variant: "warning",
						message: "Too many attempts. Please wait a moment and try again.",
					});
					return;
				}

				setAuthError({
					variant: "error",
					message: "Something went wrong. Please try again.",
				});
			},
		});
	};

	const handleDialogSuccess = () => {
		setShowDialog(false);
		reset();

		// The server logs out every device after a reset, so clear the saved user
		// too, or the sign-in page may think they're still logged in.
		queryClient.invalidateQueries({ queryKey: ["currentUser"] });

		toast.success("Password reset successfully. Please sign in.");
		navigate(ROUTES.ROOT);
	};

	const handleDialogBack = () => {
		setShowDialog(false);
	};

	return (
		<>
			<div className="w-full max-w-[400px]">
				<div className="space-y-2 text-center">
					<h2 className="font-heading text-3xl font-bold">Forgot Password</h2>
					<p className="text-sm text-muted-foreground">
						Enter your email and we&apos;ll send you a code to reset your
						password
					</p>
				</div>

				{authError && (
					<AlertBanner variant={authError.variant} className="mt-6">
						{authError.message}
					</AlertBanner>
				)}

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6 mb-3">
					<FormField
						label="Email Address"
						id="email"
						type="email"
						autoComplete="off"
						placeholder="Enter your email address"
						error={errors.email?.message}
						{...register("email")}
					/>

					<Button
						type="submit"
						className="w-full h-11 cursor-pointer disabled:pointer-events-auto disabled:cursor-not-allowed disabled:hover:bg-primary"
						disabled={isPending || !isValid}
					>
						<span className="text-base font-medium">
							{isPending ? "Sending..." : "Send Reset Code"}
						</span>
					</Button>
				</form>

				<p className="text-center text-sm text-muted-foreground">
					Remember your password?{" "}
					<Link
						to={ROUTES.ROOT}
						className="font-medium text-primary hover:underline"
					>
						Back to Sign In
					</Link>
				</p>
			</div>

			{showDialog && (
				<ForgotPasswordDialog
					email={submittedEmail}
					onSuccess={handleDialogSuccess}
					onBack={handleDialogBack}
				/>
			)}
		</>
	);
};

export default ForgotPasswordPage;
