//* src/api/admin.api.ts

import axiosClient from "@/config/axiosClient";
import type { ApiSuccessResponse } from "@/types/api.types";
import type { UserRole } from "@/types/auth.types";
import type {
	UserDetailPayload,
	UserItemPayload,
	UsersListParams,
	UsersListPayload,
	SystemOverviewPayload,
	ChangeRolePayload,
	ForceLogoutPayload,
	HardDeletePayload,
} from "@/types/admin.types";

/**
 * Fetches a paginated, optionally filtered list of users.
 * `undefined` and empty-string values are stripped from `params`
 * so the URL stays clean and React Query keys don't change when filters are cleared.
 */
const listUsers = async (params: UsersListParams) => {
	const cleanedParams = Object.fromEntries(
		Object.entries(params).filter(
			([, value]) => value !== undefined && value !== "",
		),
	);

	const { data } = await axiosClient.get<ApiSuccessResponse<UsersListPayload>>(
		"/admin/users",
		{ params: cleanedParams },
	);

	return data;
};

/**
 * Fetches a single user with derived storage / file / directory / session metrics
 */
const getUserById = async (id: string) => {
	const { data } = await axiosClient.get<ApiSuccessResponse<UserDetailPayload>>(
		`/admin/users/${id}`,
	);
	return data;
};

/**
 * Fetches system-wide aggregates for the admin dashboard.
 */
const getSystemOverview = async () => {
	const { data } =
		await axiosClient.get<ApiSuccessResponse<SystemOverviewPayload>>(
			"/admin/overview",
		);
	return data;
};

/**
 * Suspends a user account.
 */
const suspendUser = async (id: string) => {
	const { data } = await axiosClient.patch<ApiSuccessResponse<UserItemPayload>>(
		`/admin/users/${id}/suspend`,
	);
	return data;
};

/**
 * Lifts a suspension on a suspended user.
 */
const unsuspendUser = async (id: string) => {
	const { data } = await axiosClient.patch<ApiSuccessResponse<UserItemPayload>>(
		`/admin/users/${id}/unsuspend`,
	);
	return data;
};

/**
 * Changes a user's role.
 */
const changeUserRole = async (id: string, role: UserRole) => {
	const body: ChangeRolePayload = { role };
	const { data } = await axiosClient.patch<ApiSuccessResponse<UserItemPayload>>(
		`/admin/users/${id}/role`,
		body,
	);
	return data;
};

/**
 * Force-logs-out a user by revoking every active session.
 */
const forceLogoutUser = async (id: string) => {
	const { data } = await axiosClient.post<
		ApiSuccessResponse<ForceLogoutPayload>
	>(`/admin/users/${id}/logout`);
	return data;
};

/**
 * Soft-deletes a user account.
 */
const softDeleteUser = async (id: string) => {
	const { data } = await axiosClient.delete<
		ApiSuccessResponse<UserItemPayload>
	>(`/admin/users/${id}/soft-delete`);
	return data;
};

/**
 * Reverses a soft-delete on a user account.
 */
const restoreUser = async (id: string) => {
	const { data } = await axiosClient.post<ApiSuccessResponse<UserItemPayload>>(
		`/admin/users/${id}/restore`,
	);
	return data;
};

/**
 * Permanently deletes a user and all their files/directories. Irreversible.
 */
const hardDeleteUser = async (id: string) => {
	const { data } = await axiosClient.delete<
		ApiSuccessResponse<HardDeletePayload>
	>(`/admin/users/${id}/hard-delete`);
	return data;
};

export {
	listUsers,
	getUserById,
	getSystemOverview,
	suspendUser,
	unsuspendUser,
	changeUserRole,
	forceLogoutUser,
	softDeleteUser,
	restoreUser,
	hardDeleteUser,
};
