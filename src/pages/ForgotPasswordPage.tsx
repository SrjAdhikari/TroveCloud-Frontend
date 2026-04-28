//* src/pages/ForgotPasswordPage.tsx

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router";

import FormField from "@/components/form/FormField";
import { Button } from "@/components/ui/button";

import ROUTES from "@/routes/paths";
import { resendOTPSchema, type ResendOTPFormData } from "@/schemas/auth.schema";

/**
 * Forgot password page — placeholder until the backend endpoint is implemented.
 * Collects the user's email but does not submit it yet.
 */
const ForgotPasswordPage = () => {
	const {
		register,
		formState: { errors },
	} = useForm<ResendOTPFormData>({
		mode: "onChange",
		resolver: zodResolver(resendOTPSchema),
	});

	return (
		<div className="w-full max-w-[400px]">
			<div className="space-y-2 text-center">
				<h2 className="font-heading text-3xl font-bold">Forgot Password</h2>
				<p className="text-sm text-muted-foreground">
					Enter your email and we&apos;ll send you a reset link
				</p>
			</div>

			<form className="space-y-6 mt-10 mb-3">
				<FormField
					label="Email Address"
					id="email"
					type="email"
					autoComplete="off"
					placeholder="Enter your email address"
					error={errors.email?.message}
					{...register("email")}
				/>

				{/* Submit — disabled until backend is ready */}
				<Button
					type="button"
					className="w-full h-11 cursor-pointer disabled:pointer-events-auto disabled:cursor-not-allowed disabled:hover:bg-primary"
					disabled
				>
					<span className="text-base font-medium">Coming Soon</span>
				</Button>
			</form>

			{/* Back to sign in link */}
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
	);
};

export default ForgotPasswordPage;
