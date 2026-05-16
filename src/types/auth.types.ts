//* src/types/auth.types.ts

/**
 * Types for auth API payloads and responses.
 * Field constraints (min/max length, format) are enforced by Zod schemas —
 * these types define structure only.
 */

export type UserRole = "user" | "admin" | "superadmin";

// GET /api/auth/me — authenticated user shape
export interface UserPayload {
	_id: string;
	name: string;
	email: string;
	role: UserRole;
	rootDirId: string;
	profilePicture: string | null;
	isVerified: boolean;
	createdAt: string;
	updatedAt: string;
}

// POST /api/auth/register
export interface RegisterPayload {
	name: string;
	email: string;
	password: string;
}

// POST /api/auth/login
export interface LoginPayload {
	email: string;
	password: string;
}

// POST /api/auth/register/verify-otp
export interface VerifyOTPPayload {
	email: string;
	otp: string;
}

// POST /api/auth/register/resend-otp
export interface ResendOTPPayload {
	email: string;
}

// POST /api/auth/forgot-password
export interface ForgotPasswordPayload {
	email: string;
}

// POST /api/auth/reset-password
export interface ResetPasswordPayload {
	email: string;
	otp: string;
	newPassword: string;
}

// POST /api/auth/google
export interface GoogleSignInPayload {
	idToken: string;
}

// POST /api/auth/github
export interface GitHubSignInPayload {
	code: string;
}
