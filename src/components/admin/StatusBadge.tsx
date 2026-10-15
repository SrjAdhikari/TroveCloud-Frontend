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

/** Badge for a user's status: active, suspended, or deleted. */
const StatusBadge = ({ status, className }: StatusBadgeProps) => (
	<Badge variant={STATUS_MAP[status].variant} className={className}>
		{STATUS_MAP[status].label}
	</Badge>
);

export default StatusBadge;
