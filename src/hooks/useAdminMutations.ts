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

export const useSuspendUser = () => {
	return useMutation({ mutationFn: suspendUser });
};

export const useUnsuspendUser = () => {
	return useMutation({ mutationFn: unsuspendUser });
};

export const useChangeUserRole = () => {
	return useMutation({
		mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
			changeUserRole(id, role),
	});
};

export const useForceLogoutUser = () => {
	return useMutation({ mutationFn: forceLogoutUser });
};

export const useSoftDeleteUser = () => {
	return useMutation({ mutationFn: softDeleteUser });
};

export const useRestoreUser = () => {
	return useMutation({ mutationFn: restoreUser });
};

export const useHardDeleteUser = () => {
	return useMutation({ mutationFn: hardDeleteUser });
};
