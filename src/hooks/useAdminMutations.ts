//* src/hooks/useAdminMutations.ts

import { useMutation } from "@tanstack/react-query";
import {
	suspendUser,
	unsuspendUser,
	changeUserRole,
	forceLogoutUser,
	softDeleteUser,
	restoreUser,
	hardDeleteUser,
} from "@/api/admin.api";
import type { UserRole } from "@/types/auth.types";

/**
 * Mutation hook for suspending a user.
 */
const useSuspendUser = () => {
	return useMutation({ mutationFn: suspendUser });
};

/**
 * Mutation hook for lifting a user's suspension.
 */
const useUnsuspendUser = () => {
	return useMutation({ mutationFn: unsuspendUser });
};

/**
 * Mutation hook for changing a user's role.
 */
const useChangeUserRole = () => {
	return useMutation({
		mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
			changeUserRole(id, role),
	});
};

/**
 * Mutation hook for force-logging-out a user (revokes all active sessions).
 */
const useForceLogoutUser = () => {
	return useMutation({ mutationFn: forceLogoutUser });
};

/**
 * Mutation hook for soft-deleting a user.
 */
const useSoftDeleteUser = () => {
	return useMutation({ mutationFn: softDeleteUser });
};

/**
 * Mutation hook for restoring a soft-deleted user.
 */
const useRestoreUser = () => {
	return useMutation({ mutationFn: restoreUser });
};

/**
 * Mutation hook for permanently deleting a user (irreversible).
 */
const useHardDeleteUser = () => {
	return useMutation({ mutationFn: hardDeleteUser });
};

export {
	useSuspendUser,
	useUnsuspendUser,
	useChangeUserRole,
	useForceLogoutUser,
	useSoftDeleteUser,
	useRestoreUser,
	useHardDeleteUser,
};
