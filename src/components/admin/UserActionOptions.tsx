//* src/components/admin/UserActionOptions.tsx

import { useState } from "react";
import { EllipsisVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConfirmActionDialog from "@/components/admin/ConfirmActionDialog";

import { useCurrentUser } from "@/hooks/useAuth";
import useAdminUserActions, {
	type SimpleAdminAction,
} from "@/hooks/useAdminUserActions";

import { canPerformAdminAction, ACTION_META } from "@/lib/adminAction";
import ADMIN_ACTION_TEXT from "@/lib/adminActionText";

import type { UserItemPayload } from "@/types/admin.types";

interface UserActionOptionsProps {
	user: UserItemPayload;
}

const ROW_ACTIONS: SimpleAdminAction[] = [
	"suspend",
	"unsuspend",
	"forceLogout",
	"softDelete",
	"restore",
];

/**
 * Row-level admin action dropdown. Filters ROW_ACTIONS via
 * canPerformAdminAction; renders nothing when no action is allowed.
 */
const UserActionOptions = ({ user }: UserActionOptionsProps) => {
	const { data: callerResponse } = useCurrentUser();
	const caller = callerResponse?.data;

	const { simpleActionHandlers } = useAdminUserActions(user);

	const [openAction, setOpenAction] = useState<SimpleAdminAction | null>(null);

	if (!caller) return null;

	const allowedActions = ROW_ACTIONS.filter((action) =>
		canPerformAdminAction(caller, user, action),
	);

	if (allowedActions.length === 0) return null;

	const closeDialog = () => setOpenAction(null);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						aria-label="More actions"
						className="size-7 shrink-0 cursor-pointer justify-self-center max-md:opacity-100 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
						onClick={(e) => e.stopPropagation()}
					>
						<EllipsisVertical aria-hidden="true" className="size-4" />
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent
					align="end"
					side="bottom"
					avoidCollisions={false}
					onClick={(e) => e.stopPropagation()}
					className="min-w-44 bg-background p-1.5"
				>
					{allowedActions.map((action) => {
						const { label, icon: Icon, variant } = ACTION_META[action];
						return (
							<DropdownMenuItem
								key={action}
								variant={variant}
								onSelect={() => setOpenAction(action)}
								className="gap-2 px-2.5 py-1.5 text-[13px] cursor-pointer focus:bg-muted focus:text-foreground not-data-[variant=destructive]:focus:**:text-foreground"
							>
								<Icon aria-hidden="true" className="size-3.5" />
								{label}
							</DropdownMenuItem>
						);
					})}
				</DropdownMenuContent>
			</DropdownMenu>

			{openAction && (
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
		</>
	);
};

export default UserActionOptions;
