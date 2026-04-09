//* src/pages/RegisterPage.tsx

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

import FormField from "@/components/form/FormField";
import { Button } from "@/components/ui/button";
import OTPDialog from "@/components/auth/OTPDialog";

import { registerSchema, type RegisterFormData } from "@/schemas/auth.schema";
import { useRegister } from "@/hooks/useAuth";

/**
 * Register page — name, email, and password form inside the shared AuthLayout.
 * On success, opens the OTP verification dialog.
 */
const RegisterPage = () => {
	const [showOTP, setShowOTP] = useState(false);
	const [email, setEmail] = useState("");
	const navigate = useNavigate();
	const { mutate, isPending } = useRegister();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<RegisterFormData>({
		mode: "onChange",
		resolver: zodResolver(registerSchema),
	});

	const onSubmit = (data: RegisterFormData) => {
		mutate(data, {
			onSuccess: (res) => {
				toast.success(res.message || `Verification code sent to ${data.email}`);
				setEmail(data.email);
				setTimeout(() => setShowOTP(true), 500);
			},
			onError: (error) => {
				toast.error(error.message);
			},
		});
	};

	const handleOTPSuccess = () => {
		setShowOTP(false);
		reset();
		navigate("/login");
	};

	const handleOTPBack = () => {
		setShowOTP(false);
	};

	return (
		<>
			<div className="w-full max-w-md rounded-2xl border border-border/50 shadow-lg p-8">
				<div className="space-y-2 text-center">
					<h2 className="font-heading text-3xl font-bold">Create Account</h2>
					<p className="text-sm text-muted-foreground">
						Enter your details to create a new account
					</p>
				</div>

				<form
					onSubmit={handleSubmit(onSubmit)}
					className="space-y-6 mt-10 mb-3"
				>
					<FormField
						label="Full Name"
						id="name"
						type="text"
						placeholder="Enter your full name"
						error={errors.name?.message}
						{...register("name")}
					/>

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
							{isPending ? "Creating account..." : "Create Account"}
						</span>
					</Button>
				</form>

				{/* Login link */}
				<p className="text-center text-sm text-muted-foreground">
					Already have an account?{" "}
					<Link
						to="/login"
						className="font-medium text-primary hover:underline"
					>
						Sign in
					</Link>
				</p>
			</div>

			{/* OTP Dialog */}
			<OTPDialog
				open={showOTP}
				email={email}
				onSuccess={handleOTPSuccess}
				onBack={handleOTPBack}
			/>
		</>
	);
};

export default RegisterPage;
