//* src/types/admin.types.ts

import type { UserPayload, UserRole } from "@/types/auth.types";

/**
 * Types for admin RBAC API responses.
 * These mirror the shapes returned by the backend's admin endpoints.
 */

export type UserStatus = "active" | "suspended" | "deleted";
export type AuthProvider = "email" | "google" | "github";

// User item returned in the paginated list and as the base for the user detail
export interface UserItemPayload extends UserPayload {
	provider: AuthProvider;
	suspendedAt: string | null;
	suspendedBy: string | null;
	deletedAt: string | null;
	status: UserStatus;
}

// Full user detail returned by GET /api/admin/users/:id
// Includes the base user item plus admin-only stats
export interface UserDetailPayload extends UserItemPayload {
	stats: {
		storageBytes: number;
		fileCount: number;
		directoryCount: number;
		activeSessionCount: number;
		lastLoginAt: string | null; // null when the user has never logged in
	};
}

// Paginated user list returned by GET /api/admin/users
export interface UsersListPayload {
	items: UserItemPayload[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

// Query parameters for GET /api/admin/users
// All parameters are optional backend  defaults page=1, limit=20
export interface UsersListParams {
	page?: number;
	limit?: number;
	q?: string;
	role?: UserRole;
	status?: UserStatus;
	includeDeleted?: boolean;
}

// Payload for PATCH /api/admin/users/:id/role
export interface ChangeRolePayload {
	role: UserRole;
}

// Point-in-time system aggregates returned by GET /api/admin/overview
export interface SystemOverviewPayload {
	users: {
		total: number;
		active: number;
		suspended: number;
		softDeleted: number;
		byRole: {
			user: number;
			admin: number;
			superadmin: number;
		};
	};
	storage: {
		totalBytes: number;
		totalFiles: number;
		totalDirectories: number;
	};
	signups: {
		last7d: number;
		last30d: number;
	};
	sessions: {
		active: number;
	};
}
