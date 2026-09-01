//* src/components/settings/ChangePasswordForm.tsx

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import FormField from "@/components/form/FormField";
import AlertBanner from "@/components/ui/alert-banner";
import toast from "@/lib/toast";

import {
	changePasswordSchema,
	type ChangePasswordFormData,
} from "@/schemas/auth.schema";
import { useChangePassword } from "@/hooks/useAuth";

/**
 * Backend error codes that belong to a specific field, with the copy shown
 * beneath it. Every code is mapped explicitly — backend messages are never
 * rendered.
 */
const FIELD_ERRORS = {
	INVALID_CREDENTIALS: {
		field: "currentPassword",
		message: "Current password is incorrect.",
	},
} as const;

/**
 * Account-level codes shown in a banner above the form rather than under a
 * field. `PROVIDER_MISMATCH` is unreachable — SecurityTab only mounts this
 * form for email accounts — so it falls through to the generic copy.
 */
const BANNER_ERRORS = {
	RATE_LIMITED: {
		variant: "warning",
		message: "Too many attempts. Please wait a moment and try again.",
	},
} as const;

const GENERIC_ERROR = "Couldn't change your password. Please try again.";

/**
 * Change-password form for email-provider accounts. Rendered only when the
 * user has a password to change — SecurityTab owns the provider branch.
 */
const ChangePasswordForm = () => {
	const { mutate, isPending } = useChangePassword();
	const [serverError, setServerError] = useState<{
		variant: "error" | "warning";
		message: string;
	} | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		setError,
		formState: { errors, isValid },
	} = useForm<ChangePasswordFormData>({
		mode: "onChange",
		resolver: zodResolver(changePasswordSchema),
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

	const onSubmit = ({
		currentPassword,
		newPassword,
	}: ChangePasswordFormData) => {
		setServerError(null);

		mutate(
			{ currentPassword, newPassword },
			{
				onSuccess: () => {
					reset();
					toast.success(
						"Password changed. You've been signed out on other devices.",
					);
				},
				onError: (error) => {
					const fieldError =
						FIELD_ERRORS[error.code as keyof typeof FIELD_ERRORS];

					if (fieldError) {
						setError(fieldError.field, { message: fieldError.message });
						return;
					}

					const bannerError =
						BANNER_ERRORS[error.code as keyof typeof BANNER_ERRORS];

					setServerError(
						bannerError ?? { variant: "error", message: GENERIC_ERROR },
					);
				},
			},
		);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
			{serverError && (
				<AlertBanner variant={serverError.variant} className="max-w-md">
					{serverError.message}
				</AlertBanner>
			)}

			<div className="max-w-md">
				<FormField
					id="current-password"
					label="Current password"
					type="password"
					autoComplete="current-password"
					placeholder="Enter current password"
					error={errors.currentPassword?.message}
					{...register("currentPassword")}
				/>
			</div>

			<div className="max-w-md">
				<FormField
					id="new-password"
					label="New password"
					type="password"
					autoComplete="new-password"
					placeholder="Enter new password"
					error={errors.newPassword?.message}
					{...register("newPassword")}
				/>
			</div>

			<div className="max-w-md">
				<FormField
					id="confirm-password"
					label="Confirm new password"
					type="password"
					autoComplete="new-password"
					placeholder="Confirm new password"
					error={errors.confirmPassword?.message}
					{...register("confirmPassword")}
				/>
			</div>

			<Button
				type="submit"
				disabled={isPending || !isValid}
				className="cursor-pointer disabled:cursor-not-allowed"
			>
				{isPending ? "Updating..." : "Update password"}
			</Button>
		</form>
	);
};

export default ChangePasswordForm;
