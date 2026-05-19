//* src/components/admin/StatusBadge.tsx

import { Badge } from "@/components/ui/badge";
import type { UserStatus } from "@/types/admin.types";

interface StatusBadgeProps {
	status: UserStatus;
	className?: string;
}

const STATUS_MAP: Record<
	UserStatus,
	{ variant: "success" | "warning" | "muted"; label: string }
> = {
	active: { variant: "success", label: "Active" },
	suspended: { variant: "warning", label: "Suspended" },
	deleted: { variant: "muted", label: "Deleted" },
};

/**
 * Pill rendering a user's derived lifecycle status. 
 * Tints come from the extended Badge variants — `success` / `warning` / `muted`.
 */
const StatusBadge = ({ status, className }: StatusBadgeProps) => (
	<Badge variant={STATUS_MAP[status].variant} className={className}>
		{STATUS_MAP[status].label}
	</Badge>
);

export default StatusBadge;
