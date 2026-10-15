//* src/hooks/useAdmin.ts

import { keepPreviousData, skipToken, useQuery } from "@tanstack/react-query";
import { getSystemOverview, getUserById, listUsers } from "@/api/admin.api";
import type { UsersListParams } from "@/types/admin.types";

/**
 * Gets the list of users for the admin page.
 * Keeps the current page on screen while the next page loads.
 */
export const useUsersList = (params: UsersListParams) => {
	return useQuery({
		queryKey: ["admin", "users", params],
		queryFn: () => listUsers(params),
		placeholderData: keepPreviousData,
	});
};

/**
 * Gets one user's details for the admin page.
 * Waits until there is a user `id` before loading.
 */
export const useUserDetail = (id: string | undefined) => {
	return useQuery({
		queryKey: ["admin", "users", id],
		queryFn: id ? () => getUserById(id) : skipToken,
	});
};

/**
 * Gets the totals for the admin overview page.
 * Reuses them for 30 seconds before loading again.
 */
export const useSystemOverview = () => {
	return useQuery({
		queryKey: ["admin", "overview"],
		queryFn: getSystemOverview,
		staleTime: 30_000,
	});
};
