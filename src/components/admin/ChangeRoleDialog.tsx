//* src/components/admin/ChangeRoleDialog.tsx

import { useState } from "react";

import ConfirmActionDialog from "@/components/admin/ConfirmActionDialog";
import FilterSelect from "@/components/ui/filter-select";

import { ACTION_META } from "@/lib/adminAction";
import ADMIN_ACTION_TEXT from "@/lib/adminActionText";
import type { UserDetailPayload } from "@/types/admin.types";
import type { UserPayload, UserRole } from "@/types/auth.types";

interface ChangeRoleDialogProps {
	user: UserDetailPayload;
	caller: UserPayload;
	onClose: () => void;
	onSubmit: (role: UserRole) => Promise<void>;
}

/** Low → high rank. Used to slice the Select to roles ≤ the caller's own rank */
const ROLES_BY_RANK: UserRole[] = ["user", "admin", "superadmin"];

const ROLE_LABELS: Record<UserRole, string> = {
	user: "User",
	admin: "Admin",
	superadmin: "Superadmin",
};

/** Change-role dialog — owns selectedRole so parent-conditional mount resets it. */
const ChangeRoleDialog = ({
	user,
	caller,
	onClose,
	onSubmit,
}: ChangeRoleDialogProps) => {
	const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);

	/** Extract roles the caller can assign: those strictly below them in ROLES_BY_RANK. */	
	const assignableOptions = ROLES_BY_RANK.slice(
		0,
		ROLES_BY_RANK.indexOf(caller.role) + 1,
	).map((role) => ({ value: role, label: ROLE_LABELS[role] }));

	return (
		<ConfirmActionDialog
			onClose={onClose}
			icon={ACTION_META.changeRole.icon}
			title={ADMIN_ACTION_TEXT.changeRole.title}
			description={ADMIN_ACTION_TEXT.changeRole.description(user.name)}
			confirmLabel={ADMIN_ACTION_TEXT.changeRole.confirmLabel}
			variant={ADMIN_ACTION_TEXT.changeRole.variant}
			errorCopy={ADMIN_ACTION_TEXT.changeRole.errorCopy}
			confirmDisabled={selectedRole === user.role}
			onConfirm={() => onSubmit(selectedRole)}
		>
			<FilterSelect<UserRole>
				value={selectedRole}
				onChange={setSelectedRole}
				options={assignableOptions}
			/>
		</ConfirmActionDialog>
	);
};

export default ChangeRoleDialog;
