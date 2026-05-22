//* src/components/admin/UserActionsBar.tsx

import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
	canPerformAdminAction,
	ACTION_META,
	MORE_ACTIONS,
	PRIMARY_BY_STATUS,
	type AdminAction,
} from "@/lib/adminAction";

import type { UserDetailPayload } from "@/types/admin.types";
import type { UserPayload } from "@/types/auth.types";

interface UserActionsBarProps {
	user: UserDetailPayload;
	caller: UserPayload;
	onSelect: (action: AdminAction) => void;
}

/**
 * Trigger buttons for admin user actions. Visibility per (caller, target)
 * gated by canPerformAdminAction; renders nothing when no action is allowed.
 */
const UserActionsBar = ({ user, caller, onSelect }: UserActionsBarProps) => {
	const primaryAction = PRIMARY_BY_STATUS[user.status];
	const canPrimary = canPerformAdminAction(caller, user, primaryAction);

	const moreActions = MORE_ACTIONS.filter((action) =>
		canPerformAdminAction(caller, user, action),
	);

	if (canPrimary) {
		const { label, icon: PrimaryIcon, variant } = ACTION_META[primaryAction];
		return (
			<div className="flex items-center gap-2">
				<Button variant={variant} onClick={() => onSelect(primaryAction)}>
					<PrimaryIcon aria-hidden="true" />
					{label}
				</Button>

				{moreActions.length > 0 && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline">
								More
								<ChevronDown aria-hidden="true" />
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent
							align="end"
							className="min-w-46 bg-background p-1.5"
						>
							{moreActions.map((action) => {
								const { label, icon: Icon, variant } = ACTION_META[action];
								return (
									<DropdownMenuItem
										key={action}
										variant={variant === "destructive" ? "destructive" : "default"}
										onSelect={() => onSelect(action)}
										className="gap-2 px-2.5 py-1.5 text-[13px] cursor-pointer focus:bg-muted focus:text-foreground not-data-[variant=destructive]:focus:**:text-foreground"
									>
										<Icon aria-hidden="true" className="size-3.5" />
										{label}
									</DropdownMenuItem>
								);
							})}
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>
		);
	}

	// No primary available. If exactly one fallback action remains (admin → user-role
	// force-logout), surface it as a single button without the "More" dropdown.
	if (moreActions.length === 1) {
		const fallbackAction = moreActions[0];
		const {
			label,
			icon: FallbackIcon,
			variant,
		} = ACTION_META[fallbackAction];

		return (
			<Button variant={variant} onClick={() => onSelect(fallbackAction)}>
				<FallbackIcon aria-hidden="true" />
				{label}
			</Button>
		);
	}

	return null;
};

export default UserActionsBar;
