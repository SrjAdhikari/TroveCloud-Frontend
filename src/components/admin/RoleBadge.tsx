//* src/components/admin/RoleBadge.tsx

import { Badge } from "@/components/ui/badge";
import cn from "@/lib/utils";
import type { UserRole } from "@/types/auth.types";

interface RoleBadgeProps {
	role: UserRole;
	className?: string;
}

const LABEL_MAP: Record<UserRole, string> = {
	user: "User",
	admin: "Admin",
	superadmin: "Superadmin",
};

/**
 * Pill rendering a user's role. `user` → shadcn `secondary`, `admin` →
 * extended `info` (blue tint), `superadmin` → accent tokens (purple,
 * dark-mode-adaptive) inlined — no `accent` Badge variant added for a single consumer.
 */
const RoleBadge = ({ role, className }: RoleBadgeProps) => {
	if (role === "superadmin") {
		return (
			<Badge
				variant="outline"
				className={cn(
					"border-transparent bg-accent text-accent-foreground",
					className,
				)}
			>
				{LABEL_MAP.superadmin}
			</Badge>
		);
	}

	return (
		<Badge
			variant={role === "admin" ? "info" : "secondary"}
			className={className}
		>
			{LABEL_MAP[role]}
		</Badge>
	);
};

export default RoleBadge;
