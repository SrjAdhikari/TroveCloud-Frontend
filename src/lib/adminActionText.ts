//* src/lib/adminActionText.ts

import type { AdminAction } from "@/lib/adminAction";

/**
 * Per-action UI text used by ConfirmActionDialog: the title, the body
 * description (templated on the target's name), the confirm-button label,
 * the dialog variant, and the error-code → static copy map.
 *
 * Centralizing here keeps the hero and the row dropdown from duplicating
 * strings, and gives QA a single place to scan when copy needs to change.
 */

interface AdminActionText {
	title: string;
	description: (name: string) => string;
	confirmLabel: string;
	variant: "default" | "destructive";
	errorCopy: Record<string, string>;
}

// Error codes the backend can return for any admin mutation regardless of
// which action was attempted. Per-action maps spread this in and override
// INVALID_INPUT with action-specific state copy.
const COMMON_ERROR_COPY: Record<string, string> = {
	CANNOT_ACT_ON_SELF:
		"You can't perform this action on your own account.",
	CANNOT_ACT_ON_PEER:
		"You can't perform this action on a user at the same or higher role.",
	USER_NOT_FOUND: "This user no longer exists.",
	INVALID_ID: "The user ID provided is invalid.",
};

const ADMIN_ACTION_TEXT: Record<AdminAction, AdminActionText> = {
	suspend: {
		title: "Suspend user",
		description: (name) =>
			`${name} will lose access immediately and all active sessions will end.`,
		confirmLabel: "Suspend",
		variant: "destructive",
		errorCopy: {
			...COMMON_ERROR_COPY,
			INVALID_INPUT: "This user is already suspended.",
		},
	},
	unsuspend: {
		title: "Unsuspend user",
		description: (name) =>
			`${name} will regain access. They'll need to sign in again.`,
		confirmLabel: "Unsuspend",
		variant: "default",
		errorCopy: {
			...COMMON_ERROR_COPY,
			INVALID_INPUT: "This user isn't currently suspended.",
		},
	},
	changeRole: {
		title: "Change user role",
		description: (name) => `Update the role assigned to ${name}.`,
		confirmLabel: "Change role",
		variant: "default",
		errorCopy: {
			...COMMON_ERROR_COPY,
			INVALID_INPUT: "Can't change the role of a deleted user.",
		},
	},
	forceLogout: {
		title: "End all sessions",
		description: (name) =>
			`${name}'s active sessions on every device will end immediately.`,
		confirmLabel: "End sessions",
		variant: "destructive",
		errorCopy: {
			...COMMON_ERROR_COPY,
			INVALID_INPUT: "Can't end sessions for a deleted user.",
		},
	},
	softDelete: {
		title: "Move user to trash",
		description: (name) =>
			`${name} will lose access and sessions will end. You can restore them later.`,
		confirmLabel: "Move to trash",
		variant: "destructive",
		errorCopy: {
			...COMMON_ERROR_COPY,
			INVALID_INPUT: "This user is already in the trash.",
		},
	},
	restore: {
		title: "Restore user",
		description: (name) =>
			`${name} will be restored. They'll need to sign in again.`,
		confirmLabel: "Restore",
		variant: "default",
		errorCopy: {
			...COMMON_ERROR_COPY,
			INVALID_INPUT: "This user isn't currently in the trash.",
		},
	},
	hardDelete: {
		title: "Permanently delete user",
		description: (name) =>
			`${name} and all of their data will be permanently deleted. This cannot be undone.`,
		confirmLabel: "Permanently delete",
		variant: "destructive",
		errorCopy: {
			...COMMON_ERROR_COPY,
		},
	},
};

export default ADMIN_ACTION_TEXT;
export type { AdminActionText };
