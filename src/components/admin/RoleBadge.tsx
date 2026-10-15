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
 * Badge for a user's role: grey for user, blue for admin, purple for
 * superadmin. Purple is set here because only this badge uses it.
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
