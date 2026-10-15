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

/** Roles from lowest to highest. */
const ROLES_BY_RANK: UserRole[] = ["user", "admin", "superadmin"];

const ROLE_LABELS: Record<UserRole, string> = {
	user: "User",
	admin: "Admin",
	superadmin: "Superadmin",
};

/** Keeps the picked role here, so it resets each time the dialog opens. */
const ChangeRoleDialog = ({
	user,
	caller,
	onClose,
	onSubmit,
}: ChangeRoleDialogProps) => {
	const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);

	// Roles the admin can give: up to and including their own role.
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
				label="New role"
				value={selectedRole}
				onChange={setSelectedRole}
				options={assignableOptions}
			/>
		</ConfirmActionDialog>
	);
};

export default ChangeRoleDialog;
