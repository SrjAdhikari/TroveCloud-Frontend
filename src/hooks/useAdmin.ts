//* src/hooks/useAdmin.ts

import { keepPreviousData, skipToken, useQuery } from "@tanstack/react-query";
import { getSystemOverview, getUserById, listUsers } from "@/api/admin.api";
import type { UsersListParams } from "@/types/admin.types";

/**
 * Query hook for the paginated/filtered user list for admin.
 * `params` is part of the query key, so filter/page changes refetch
 * automatically. `keepPreviousData` keeps the prior page visible during
 * a refetch so pagination doesn't flash a skeleton between page flips.
 */
const useUsersList = (params: UsersListParams) => {
	return useQuery({
		queryKey: ["admin", "users", params],
		queryFn: () => listUsers(params),
		placeholderData: keepPreviousData,
	});
};

/**
 * Query hook for a single user with admin-only stats.
 * `skipToken` keeps the query inert (no fetch, no error) until `id` is
 * present — cleaner than a non-null assertion gated by `enabled`.
 */
const useUserDetail = (id: string | undefined) => {
	return useQuery({
		queryKey: ["admin", "users", id],
		queryFn: id ? () => getUserById(id) : skipToken,
	});
};

/**
 * Query hook for system-wide admin dashboard aggregates.
 * Cached for 30s — point-in-time numbers tolerate brief staleness.
 */
const useSystemOverview = () => {
	return useQuery({
		queryKey: ["admin", "overview"],
		queryFn: getSystemOverview,
		staleTime: 30_000,
	});
};

export { useUsersList, useUserDetail, useSystemOverview };
