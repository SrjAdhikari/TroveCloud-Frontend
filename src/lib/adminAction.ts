//* src/lib/adminAction.ts

import type { UserPayload, UserRole } from "@/types/auth.types";
import type { UserDetailPayload, UserItemPayload, UserStatus } from "@/types/admin.types";

type AdminAction =
	| "suspend"
	| "unsuspend"
	| "changeRole"
	| "forceLogout"
	| "softDelete"
	| "restore"
	| "hardDelete";

const ROLE_RANK: Record<UserRole, number> = {
	user: 0,
	admin: 1,
	superadmin: 2,
};

const statePreconditionMet = (action: AdminAction, status: UserStatus): boolean => {
	switch (action) {
		case "suspend":
			return status === "active";
		case "unsuspend":
			return status === "suspended";
		case "restore":
			return status === "deleted";
		case "softDelete":
		case "changeRole":
		case "forceLogout":
			return status !== "deleted";
		case "hardDelete":
			return true;
	}
};

/**
 * Returns true when the caller is permitted to perform the given action on the
 * target user, mirroring the backend's role + state + self/peer gates. Backend
 * remains the source of truth; this is a defense-in-depth helper for UI gating.
 */
const canPerformAdminAction = (
	caller: UserPayload,
	target: UserItemPayload | UserDetailPayload,
	action: AdminAction,
): boolean => {
	if (caller._id === target._id) return false;
	if (ROLE_RANK[caller.role] <= ROLE_RANK[target.role]) return false;
	if (!statePreconditionMet(action, target.status)) return false;
	if (action === "forceLogout") return true;

	return caller.role === "superadmin";
};

export default canPerformAdminAction;
export type { AdminAction };
