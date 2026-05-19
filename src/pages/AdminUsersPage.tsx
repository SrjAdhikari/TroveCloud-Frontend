//* src/pages/AdminUsersPage.tsx

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";

import { useUsersList } from "@/hooks/useAdmin";
import useDebounce from "@/hooks/useDebounce";

import UsersToolbar from "@/components/admin/UsersToolbar";
import UsersTable from "@/components/admin/UsersTable";
import UsersPagination from "@/components/admin/UsersPagination";
import UsersLoadFailed from "@/components/admin/UsersLoadFailed";
import LoadingSpinner from "@/components/ui/loading-spinner";

import type { UserRole } from "@/types/auth.types";
import type { UsersListParams, UserStatus } from "@/types/admin.types";

const VALID_ROLES = new Set<UserRole>(["user", "admin", "superadmin"]);
const VALID_STATUSES = new Set<UserStatus>(["active", "suspended", "deleted"]);

/**
 * Reads `useSearchParams` snapshot into a typed UsersListParams.
 * Garbage values are silently dropped — direct URL editing won't error.
 */
const parseUsersParams = (searchParams: URLSearchParams): UsersListParams => {
	const q = searchParams.get("q")?.trim() || undefined;

	const roleRaw = searchParams.get("role") as UserRole | null;
	const role = roleRaw && VALID_ROLES.has(roleRaw) ? roleRaw : undefined;

	const statusRaw = searchParams.get("status") as UserStatus | null;
	const status =
		statusRaw && VALID_STATUSES.has(statusRaw) ? statusRaw : undefined;

	const includeDeleted =
		!status && searchParams.get("includeDeleted") === "true" ? true : undefined;

	const pageNum = Number(searchParams.get("page"));
	const page = Number.isInteger(pageNum) && pageNum >= 1 ? pageNum : undefined;

	return { q, role, status, includeDeleted, page };
};

const AdminUsersPage = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const params = useMemo(() => parseUsersParams(searchParams), [searchParams]);

	const [localQuery, setLocalQuery] = useState(params.q ?? "");
	const debouncedQuery = useDebounce(localQuery, 300);

	/**
	 * Sync localQuery with URL `q` param changes. This covers
	 * back/forward navigation and external links, while ignoring
	 * localQuery changes which are already in sync with the URL.
	 */
	useEffect(() => {
		const urlQuery = params.q ?? "";
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setLocalQuery((current) => (current === urlQuery ? current : urlQuery));
	}, [params.q]);

	useEffect(() => {
		const trimmed = debouncedQuery.trim();
		setSearchParams(
			(prev) => {
				const currentQuery = prev.get("q") ?? "";
				if (currentQuery === trimmed) return prev;

				const next = new URLSearchParams(prev);
				if (trimmed) next.set("q", trimmed);
				else next.delete("q");

				next.delete("page");
				return next;
			},
			{ replace: true },
		);
	}, [debouncedQuery, setSearchParams]);

	const { data, isLoading, isFetching, error, refetch } = useUsersList(params);

	if (isLoading) {
		return <LoadingSpinner fullScreen />;
	}

	if (error) {
		return <UsersLoadFailed error={error} onRetry={refetch} />;
	}

	const list = data?.data;
	const items = list?.items ?? [];
	const pagination = list?.pagination;
	const isFiltered = Boolean(
		params.q || params.role || params.status || params.includeDeleted,
	);

	const updateUrl = (
		patch: Record<string, string | number | boolean | undefined>,
	) => {
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				const touchesNonPage = Object.keys(patch).some((k) => k !== "page");

				Object.entries(patch).forEach(([key, value]) => {
					if (value === undefined || value === false || value === "") {
						next.delete(key);
					} else {
						next.set(key, String(value));
					}
				});

				if (touchesNonPage) next.delete("page");
				return next;
			},
			{ replace: true },
		);
	};

	const handleClearFilters = () => {
		setLocalQuery("");
		updateUrl({
			q: undefined,
			role: undefined,
			status: undefined,
			includeDeleted: undefined,
			page: undefined,
		});
	};

	return (
		<>
			<div className="-mx-6 -mt-6 mb-6 border-b px-4 py-3 sm:px-6">
				<UsersToolbar
					localQuery={localQuery}
					onLocalQueryChange={setLocalQuery}
					role={params.role}
					status={params.status}
					includeDeleted={params.includeDeleted ?? false}
					onRoleChange={(role) => updateUrl({ role })}
					onStatusChange={(status) =>
						updateUrl({ status, includeDeleted: undefined })
					}
					onIncludeDeletedChange={(checked) =>
						updateUrl({ includeDeleted: checked || undefined })
					}
				/>
			</div>

			<div className="space-y-4">
				<UsersTable
					items={items}
					isFetching={isFetching}
					isFiltered={isFiltered}
					page={pagination?.page ?? 1}
					totalPages={pagination?.totalPages ?? 0}
					onClearFilters={handleClearFilters}
					onResetPage={() => updateUrl({ page: undefined })}
				/>

				{pagination && pagination.totalPages > 1 && (
					<UsersPagination
						page={pagination.page}
						totalPages={pagination.totalPages}
						onPrev={() => updateUrl({ page: Math.max(1, pagination.page - 1) })}
						onNext={() =>
							updateUrl({
								page: Math.min(pagination.totalPages, pagination.page + 1),
							})
						}
					/>
				)}
			</div>
		</>
	);
};

export default AdminUsersPage;
