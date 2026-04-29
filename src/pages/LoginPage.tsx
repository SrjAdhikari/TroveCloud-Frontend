//* src/pages/LoginPage.tsx

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router";
import { useQueryClient } from "@tanstack/react-query";

import FormField from "@/components/form/FormField";
import { Button } from "@/components/ui/button";
import AlertBanner from "@/components/ui/alert-banner";
import OTPDialog from "@/components/auth/OTPDialog";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import GitHubSignInButton from "@/components/auth/GitHubSignInButton";
import OrDivider from "@/components/auth/OrDivider";
import toast from "@/lib/toast";

import ROUTES from "@/routes/paths";
import { loginSchema, type LoginFormData } from "@/schemas/auth.schema";
import { useLogin } from "@/hooks/useAuth";
import useGoogleAuth from "@/hooks/useGoogleAuth";

/**
 * Login page — email and password form inside the shared AuthLayout.
 * On success, navigates to dashboard via query invalidation.
 * On USER_NOT_VERIFIED, opens OTP dialog.
 * Other errors render inline as an AlertBanner above the form.
 */
const LoginPage = () => {
	const [showOTP, setShowOTP] = useState(false);
	const [email, setEmail] = useState("");
	const [authError, setAuthError] = useState<string | null>(null);

	const { mutate, isPending } = useLogin();
	const queryClient = useQueryClient();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isValid },
	} = useForm<LoginFormData>({
		mode: "onChange",
		resolver: zodResolver(loginSchema),
	});

	const {
		handleSuccess: handleGoogleSuccess,
		handleError: handleGoogleError,
		isPending: isGoogleSigningIn,
	} = useGoogleAuth({
		setError: setAuthError,
		onSuccess: reset,
	});

	const onSubmit = (data: LoginFormData) => {
		setAuthError(null);
		mutate(data, {
			onSuccess: () => {
				reset();
				// Invalidate cached auth state so GuestRoute refetches and
				// redirects to /my-files. useCurrentUser uses staleTime: Infinity,
				// so manual invalidation is required.
				queryClient.invalidateQueries({ queryKey: ["currentUser"] });
			},
			onError: (error) => {
				if (error.code === "USER_NOT_VERIFIED") {
					setAuthError("Please verify your email before signing in.");
					setEmail(data.email);

					setTimeout(() => {
						setAuthError(null);
						setShowOTP(true);
					}, 1500);

					return;
				}

				setAuthError(
					error.message || "Something went wrong. Please try again.",
				);
			},
		});
	};

	const handleOTPSuccess = () => {
		setShowOTP(false);
		toast.success("Email verified! Please login again.");
	};

	const handleOTPBack = () => {
		setShowOTP(false);
	};

	return (
		<>
			<div className="w-full max-w-[400px]">
				<div className="space-y-2 text-center">
					<h2 className="font-heading text-3xl font-bold">Welcome Back</h2>
					<p className="text-sm text-muted-foreground">
						Enter your credentials to continue to TroveCloud
					</p>
				</div>

				<div className="mt-6 space-y-3">
					<GoogleSignInButton
						onSuccess={handleGoogleSuccess}
						onError={handleGoogleError}
					/>

					<GitHubSignInButton
						disabled={isPending || isGoogleSigningIn}
					/>
				</div>

				<div className="mt-6">
					<OrDivider label="Or continue with email" />
				</div>

				{authError && (
					<AlertBanner variant="error" className="mt-4">
						{authError}
					</AlertBanner>
				)}

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-5 mb-3">
					<FormField
						label="Email Address"
						id="email"
						type="email"
						autoComplete="off"
						placeholder="Enter your email address"
						error={errors.email?.message}
						{...register("email")}
					/>

					<FormField
						label="Password"
						id="password"
						type="password"
						autoComplete="off"
						placeholder="Enter your password"
						error={errors.password?.message}
						labelExtra={
							<Link
								to={ROUTES.FORGOT_PASSWORD}
								className="text-xs text-muted-foreground hover:text-accent-foreground hover:underline cursor-pointer"
							>
								Forgot password?
							</Link>
						}
						{...register("password")}
					/>

					<Button
						type="submit"
						className="w-full h-11 cursor-pointer disabled:pointer-events-auto disabled:cursor-not-allowed disabled:hover:bg-primary"
						disabled={isPending || isGoogleSigningIn || !isValid}
					>
						<span className="text-base font-medium">
							{isPending ? "Signing in..." : "Sign in"}
						</span>
					</Button>
				</form>

				<p className="text-center text-sm text-muted-foreground">
					Don&apos;t have an account?{" "}
					<Link
						to={ROUTES.CREATE_ACCOUNT}
						className="font-medium text-primary hover:underline"
					>
						Sign up
					</Link>
				</p>
			</div>

			{/* OTP Dialog — shown when an unverified user attempts to login */}
			<OTPDialog
				open={showOTP}
				email={email}
				onSuccess={handleOTPSuccess}
				onBack={handleOTPBack}
			/>
		</>
	);
};

export default LoginPage;
