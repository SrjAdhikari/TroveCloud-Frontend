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
 * Gets a page of users, with optional filters. Empty filters are left out
 * so the URL stays clean.
 */
export const listUsers = async (params: UsersListParams) => {
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

/** Gets one user, plus their storage, file, folder, and session counts. */
export const getUserById = async (id: string) => {
	const { data } = await axiosClient.get<ApiSuccessResponse<UserDetailPayload>>(
		`/admin/users/${id}`,
	);
	return data;
};

/** Gets the site-wide totals for the admin overview page. */
export const getSystemOverview = async () => {
	const { data } =
		await axiosClient.get<ApiSuccessResponse<SystemOverviewPayload>>(
			"/admin/overview",
		);
	return data;
};

export const suspendUser = async (id: string) => {
	const { data } = await axiosClient.patch<ApiSuccessResponse<UserItemPayload>>(
		`/admin/users/${id}/suspend`,
	);
	return data;
};

export const unsuspendUser = async (id: string) => {
	const { data } = await axiosClient.patch<ApiSuccessResponse<UserItemPayload>>(
		`/admin/users/${id}/unsuspend`,
	);
	return data;
};

export const changeUserRole = async (id: string, role: UserRole) => {
	const body: ChangeRolePayload = { role };
	const { data } = await axiosClient.patch<ApiSuccessResponse<UserItemPayload>>(
		`/admin/users/${id}/role`,
		body,
	);
	return data;
};

/** Logs a user out of every device. */
export const forceLogoutUser = async (id: string) => {
	const { data } = await axiosClient.post<
		ApiSuccessResponse<ForceLogoutPayload>
	>(`/admin/users/${id}/logout`);
	return data;
};

/** Moves a user to the trash; they can be restored. */
export const softDeleteUser = async (id: string) => {
	const { data } = await axiosClient.delete<
		ApiSuccessResponse<UserItemPayload>
	>(`/admin/users/${id}/soft-delete`);
	return data;
};

export const restoreUser = async (id: string) => {
	const { data } = await axiosClient.post<ApiSuccessResponse<UserItemPayload>>(
		`/admin/users/${id}/restore`,
	);
	return data;
};

/** Deletes a user and all their files and folders for good. */
export const hardDeleteUser = async (id: string) => {
	const { data } = await axiosClient.delete<
		ApiSuccessResponse<HardDeletePayload>
	>(`/admin/users/${id}/hard-delete`);
	return data;
};
