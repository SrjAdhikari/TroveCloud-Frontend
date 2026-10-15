//* src/schemas/auth.schema.ts

import { z } from "zod/v4";

/**
 * Shared password-strength policy, mirroring what the backend enforces.
 * Login deliberately opts out — you sign in with whatever you already have.
 */
const strongPasswordSchema = z
	.string()
	.trim()
	.min(8, "Password must be at least 8 characters")
	.regex(/[a-z]/, "Password must contain at least one lowercase letter")
	.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
	.regex(/[0-9]/, "Password must contain at least one number")
	.regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

/**
 * Validation schema for the register form.
 */
export const registerSchema = z.object({
	name: z
		.string()
		.trim()
		.nonempty("Name is required")
		.min(3, "Name must be at least 3 characters")
		.max(50, "Name must be at most 50 characters"),

	email: z.email("Please enter a valid email address"),
	password: strongPasswordSchema,
});

/**
 * Validation schema for the login form.
 */
export const loginSchema = z.object({
	email: z.email("Please enter a valid email address"),
	password: z.string().trim().nonempty("Password is required"),
});

/**
 * Validation schema for the OTP verification form.
 */
export const verifyOTPSchema = z.object({
	email: z.email("Please enter a valid email address"),
	otp: z
		.string()
		.trim()
		.length(6, "OTP must be 6 digits")
		.regex(/^\d+$/, "OTP must contain only numbers"),
});

/**
 * Validation schema for the resend OTP form and Forgot Password form.
 */
export const resendOTPSchema = z.object({
	email: z.email("Please enter a valid email address"),
});

/**
 * Validation schema for the reset password form.
 */
export const resetPasswordSchema = z
	.object({
		newPassword: strongPasswordSchema,
		confirmPassword: z.string().trim().nonempty("Please confirm your password"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

/**
 * Validation schema for the change-password form. The reuse check preempts the
 * backend's PASSWORD_REUSE rejection so the user gets it inline.
 */
export const changePasswordSchema = z
	.object({
		currentPassword: z.string().trim().nonempty("Current password is required"),
		newPassword: strongPasswordSchema,
		confirmPassword: z.string().trim().nonempty("Please confirm your password"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	})
	.refine((data) => data.newPassword !== data.currentPassword, {
		message: "New password must be different from your current password",
		path: ["newPassword"],
	});

/** Inferred types from schemas — use these as form types */
export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type VerifyOTPFormData = z.infer<typeof verifyOTPSchema>;
export type ResendOTPFormData = z.infer<typeof resendOTPSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
