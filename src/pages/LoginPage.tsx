//* src/pages/LoginPage.tsx

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import FormField from "@/components/form/FormField";
import { Button } from "@/components/ui/button";
import OTPDialog from "@/components/auth/OTPDialog";

import { loginSchema, type LoginFormData } from "@/schemas/auth.schema";
import { useLogin } from "@/hooks/useAuth";

/**
 * Login page — email and password form inside the shared AuthLayout.
 * On success, navigates to dashboard. On USER_NOT_VERIFIED, opens OTP dialog.
 */
const LoginPage = () => {
	const [showOTP, setShowOTP] = useState(false);
	const [email, setEmail] = useState("");
	const { mutate, isPending } = useLogin();
	const queryClient = useQueryClient();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<LoginFormData>({
		mode: "onChange",
		resolver: zodResolver(loginSchema),
	});

	const onSubmit = (data: LoginFormData) => {
		mutate(data, {
			onSuccess: (res) => {
				toast.success(res.message || "Login successful");
				reset();

				// Invalidate cached auth state so "GuestRoute" refetches and redirects to "/dashboard"
				// Because we set staleTime to Infinity in "useCurrentUser". So, manual invalidation is required
				queryClient.invalidateQueries({ queryKey: ["currentUser"] });
			},
			onError: (error) => {
				if (error.code === "USER_NOT_VERIFIED") {
					setEmail(data.email);
					setShowOTP(true);
				}
				toast.error(error.message);
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
			<div className="w-full max-w-md rounded-2xl border border-border/50 shadow-lg p-8">
				<div className="space-y-2 text-center">
					<h2 className="font-heading text-3xl font-bold">Welcome Back</h2>
					<p className="text-sm text-muted-foreground">
						Enter your credentials to continue to TroveCloud
					</p>
				</div>

				<form
					onSubmit={handleSubmit(onSubmit)}
					className="space-y-6 mt-10 mb-3"
				>
					<FormField
						label="Email"
						id="email"
						type="email"
						placeholder="Enter your email"
						error={errors.email?.message}
						{...register("email")}
					/>

					<FormField
						label="Password"
						id="password"
						type="password"
						placeholder="Enter your password"
						error={errors.password?.message}
						{...register("password")}
					/>

					{/* Submit */}
					<Button
						type="submit"
						className="w-full cursor-pointer"
						disabled={isPending}
					>
						<span className="text-base font-medium">
							{isPending ? "Logging in..." : "Login"}
						</span>
					</Button>
				</form>

				<div className="space-y-1">
					{/* Forgot password link */}
					<Link
						to="/forgot-password"
						className="block text-center text-sm text-muted-foreground hover:text-foreground"
					>
						Forgot password?
					</Link>

					{/* Register link */}
					<p className="text-center text-sm text-muted-foreground">
						New to TroveCloud?{" "}
						<Link
							to="/register"
							className="font-medium text-primary hover:underline"
						>
							Create Account
						</Link>
					</p>
				</div>
			</div>

			{/* OTP Dialog — shown when unverified user tries to login */}
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
