//* src/hooks/useAdminUserActions.ts

import { useQueryClient } from "@tanstack/react-query";

import {
	useForceLogoutUser,
	useRestoreUser,
	useSoftDeleteUser,
	useSuspendUser,
	useUnsuspendUser,
} from "@/hooks/useAdminMutations";
import toast from "@/lib/toast";

import type { AdminAction } from "@/lib/adminAction";
import type { UserDetailPayload, UserItemPayload } from "@/types/admin.types";

// Actions that share the same confirm-then-mutate-then-feedback shape.
type SimpleAdminAction = Exclude<AdminAction, "changeRole" | "hardDelete">;

interface AdminUserActions {
	simpleActionHandlers: Record<SimpleAdminAction, () => Promise<void>>;
	invalidateUsers: () => Promise<void>;
	invalidateUsersAndOverview: () => Promise<void>;
}

/**
 * Shared mutation + invalidation handlers for the 5 simple admin actions.
 * Consumed by UserActions (detail page) and UserActionOptions (row dropdown).
 */
const useAdminUserActions = (
	user: UserDetailPayload | UserItemPayload,
): AdminUserActions => {
	const queryClient = useQueryClient();

	const suspend = useSuspendUser();
	const unsuspend = useUnsuspendUser();
	const forceLogout = useForceLogoutUser();
	const softDelete = useSoftDeleteUser();
	const restore = useRestoreUser();

	const invalidateUsers = () =>
		queryClient.invalidateQueries({ queryKey: ["admin", "users"] });

	const invalidateUsersAndOverview = async () => {
		await invalidateUsers();
		await queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
	};

	const simpleActionHandlers: Record<SimpleAdminAction, () => Promise<void>> = {
		suspend: async () => {
			await suspend.mutateAsync(user._id);
			await invalidateUsersAndOverview();
		},
		unsuspend: async () => {
			await unsuspend.mutateAsync(user._id);
			await invalidateUsersAndOverview();
		},
		forceLogout: async () => {
			await forceLogout.mutateAsync(user._id);
			await invalidateUsers();
			toast.success("All sessions invalidated for user");
		},
		softDelete: async () => {
			await softDelete.mutateAsync(user._id);
			await invalidateUsersAndOverview();
		},
		restore: async () => {
			await restore.mutateAsync(user._id);
			await invalidateUsersAndOverview();
			toast.success("User restored");
		},
	};

	return { simpleActionHandlers, invalidateUsers, invalidateUsersAndOverview };
};

export default useAdminUserActions;
export type { SimpleAdminAction };
