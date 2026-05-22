//* src/components/admin/UserActions.tsx

import { useState } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";

import ChangeRoleDialog from "@/components/admin/ChangeRoleDialog";
import ConfirmActionDialog from "@/components/admin/ConfirmActionDialog";
import HardDeleteDialog from "@/components/admin/HardDeleteDialog";
import UserActionsBar from "@/components/admin/UserActionsBar";

import { ACTION_META, type AdminAction } from "@/lib/adminAction";
import ADMIN_ACTION_TEXT from "@/lib/adminActionText";
import toast from "@/lib/toast";

import { useCurrentUser } from "@/hooks/useAuth";
import {
	useChangeUserRole,
	useHardDeleteUser,
} from "@/hooks/useAdminMutations";
import useAdminUserActions, {
	type SimpleAdminAction,
} from "@/hooks/useAdminUserActions";

import ROUTES from "@/routes/paths";
import type { UserDetailPayload } from "@/types/admin.types";

interface UserActionsProps {
	user: UserDetailPayload;
}

const SIMPLE_ACTIONS = new Set<AdminAction>([
	"suspend",
	"unsuspend",
	"forceLogout",
	"softDelete",
	"restore",
]);

const isSimpleAction = (action: AdminAction): action is SimpleAdminAction =>
	SIMPLE_ACTIONS.has(action);

/**
 * Owns the open-dialog state and dispatches mutation + invalidation + feedback
 * on confirm. Triggers in UserActionsBar; cache invalidates at the call site.
 */
const UserActions = ({ user }: UserActionsProps) => {
	const { data: callerResponse } = useCurrentUser();
	const caller = callerResponse?.data;

	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const { simpleActionHandlers, invalidateUsers, invalidateUsersAndOverview } =
		useAdminUserActions(user);

	const [openAction, setOpenAction] = useState<AdminAction | null>(null);

	const changeRole = useChangeUserRole();
	const hardDelete = useHardDeleteUser();

	if (!caller) return null;

	const closeDialog = () => setOpenAction(null);

	return (
		<>
			<UserActionsBar user={user} caller={caller} onSelect={setOpenAction} />

			{openAction && isSimpleAction(openAction) && (
				<ConfirmActionDialog
					onClose={closeDialog}
					icon={ACTION_META[openAction].icon}
					title={ADMIN_ACTION_TEXT[openAction].title}
					description={ADMIN_ACTION_TEXT[openAction].description(user.name)}
					confirmLabel={ADMIN_ACTION_TEXT[openAction].confirmLabel}
					variant={ADMIN_ACTION_TEXT[openAction].variant}
					errorCopy={ADMIN_ACTION_TEXT[openAction].errorCopy}
					onConfirm={simpleActionHandlers[openAction]}
				/>
			)}

			{openAction === "changeRole" && (
				<ChangeRoleDialog
					user={user}
					caller={caller}
					onClose={closeDialog}
					onSubmit={async (role) => {
						await changeRole.mutateAsync({ id: user._id, role });
						await invalidateUsers();
					}}
				/>
			)}

			{openAction === "hardDelete" && (
				<HardDeleteDialog
					onClose={closeDialog}
					userName={user.name}
					userEmail={user.email}
					onConfirm={async () => {
						await hardDelete.mutateAsync(user._id);
						queryClient.removeQueries({
							queryKey: ["admin", "users", user._id],
						});
						navigate(ROUTES.ADMIN_USERS);
						void invalidateUsersAndOverview();
						toast.success("User permanently deleted");
					}}
				/>
			)}
		</>
	);
};

export default UserActions;
