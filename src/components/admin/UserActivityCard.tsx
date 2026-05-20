//* src/components/admin/UserActivityCard.tsx

import { Clock, Database, File, Folder, Monitor } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import {
	formatDateTime,
	formatFileSize,
	formatNumber,
} from "@/lib/formatters";
import type { UserDetailPayload } from "@/types/admin.types";

interface UserActivityCardProps {
	stats: UserDetailPayload["stats"];
}

interface ActivityInfoRowProps {
	icon: LucideIcon;
	label: string;
	value: string;
}

/**
 * Helper component for a single row of user activity info
 */
const ActivityInfoRow = ({
	icon: Icon,
	label,
	value,
}: ActivityInfoRowProps) => (
	<div className="flex justify-between px-3 py-3">
		<dt className="flex items-center gap-3 text-muted-foreground">
			<Icon aria-hidden="true" className="size-4 text-foreground/70" />
			{label}
		</dt>
		<dd className="font-medium text-foreground">{value}</dd>
	</div>
);

/**
 * Card displaying a user's activity stats: storage used, 
 * file/directory count, active sessions, and last login time. 
 */
const UserActivityCard = ({ stats }: UserActivityCardProps) => {
	return (
		<Card className="bg-background">
			<CardContent className="space-y-5">
				<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
					Activity
				</p>

				<dl className="grid divide-y divide-border text-sm">
					<ActivityInfoRow
						icon={Database}
						label="Storage used"
						value={formatFileSize(stats.storageBytes)}
					/>
					<ActivityInfoRow
						icon={File}
						label="Files"
						value={formatNumber(stats.fileCount)}
					/>
					<ActivityInfoRow
						icon={Folder}
						label="Directories"
						value={formatNumber(stats.directoryCount)}
					/>
					<ActivityInfoRow
						icon={Monitor}
						label="Active sessions"
						value={formatNumber(stats.activeSessionCount)}
					/>
					<ActivityInfoRow
						icon={Clock}
						label="Last login"
						value={
							stats.lastLoginAt
								? formatDateTime(stats.lastLoginAt)
								: "No logins yet"
						}
					/>
				</dl>
			</CardContent>
		</Card>
	);
};

export default UserActivityCard;
