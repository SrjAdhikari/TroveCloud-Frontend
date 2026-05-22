//* src/lib/adminAction.ts

import {
	CircleAlert,
	Ban,
	LogOut,
	RotateCcw,
	Trash2,
	UserRoundCheck,
	UserRoundKey,
	type LucideIcon,
} from "lucide-react";

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
 * True when the caller may perform `action` on `target`. Mirrors the backend's
 * role + state + self/peer gates — defense in depth for UI gating only.
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

interface ActionMeta {
	label: string;
	variant: "default" | "destructive";
	icon: LucideIcon;
}

const ACTION_META: Record<AdminAction, ActionMeta> = {
	suspend: { label: "Suspend", variant: "destructive", icon: Ban },
	unsuspend: { label: "Unsuspend", variant: "default", icon: UserRoundCheck },
	restore: { label: "Restore", variant: "default", icon: RotateCcw },
	changeRole: { label: "Change Role", variant: "default", icon: UserRoundKey },
	forceLogout: { label: "Force Logout", variant: "destructive", icon: LogOut },
	softDelete: { label: "Move to Trash", variant: "destructive", icon: Trash2  },
	hardDelete: {
		label: "Delete Permanently",
		variant: "destructive",
		icon: CircleAlert,
	},
};

const PRIMARY_BY_STATUS: Record<UserStatus, AdminAction> = {
	active: "suspend",
	suspended: "unsuspend",
	deleted: "restore",
};

// Order matters — these render top-to-bottom in any "More" / row dropdown.
const MORE_ACTIONS: AdminAction[] = [
	"changeRole",
	"forceLogout",
	"softDelete",
	"hardDelete",
];

export {
	canPerformAdminAction,
	ACTION_META,
	PRIMARY_BY_STATUS,
	MORE_ACTIONS,
};
export type { AdminAction, ActionMeta };
