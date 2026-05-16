//* src/api/admin.api.ts

import axiosClient from "@/config/axiosClient";
import type { ApiSuccessResponse } from "@/types/api.types";
import type {
	UserDetailPayload,
	UsersListParams,
	UsersListPayload,
	SystemOverviewPayload,
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

export { listUsers, getUserById, getSystemOverview };
