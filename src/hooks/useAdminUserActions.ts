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

// Actions that all work the same way: confirm, run, then show the result.
export type SimpleAdminAction = Exclude<
	AdminAction,
	"changeRole" | "hardDelete"
>;

interface AdminUserActions {
	simpleActionHandlers: Record<SimpleAdminAction, () => Promise<void>>;
	invalidateUsers: () => Promise<void>;
	invalidateUsersAndOverview: () => Promise<void>;
}

/** Shared handlers for the simple admin actions. */
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
