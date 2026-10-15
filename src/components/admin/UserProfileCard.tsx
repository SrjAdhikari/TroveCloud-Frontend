//* src/components/admin/UserProfileCard.tsx

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

import cn from "@/lib/utils";
import getInitials from "@/lib/getInitials";
import { formatDate } from "@/lib/formatters";
import type { UserDetailPayload } from "@/types/admin.types";

interface UserProfileCardProps {
	user: UserDetailPayload;
}

interface ProfileInfoRowProps {
	label: string;
	value: string;
	valueClassName?: string;
}

const ProfileInfoRow = ({
	label,
	value,
	valueClassName,
}: ProfileInfoRowProps) => (
	<div className="flex justify-between gap-2 px-2 py-3">
		<dt className="text-muted-foreground">{label}</dt>
		<dd className={cn("text-foreground", valueClassName)}>{value}</dd>
	</div>
);

/** Shows a user's profile: photo, name, email, sign-up method, and more. */
const UserProfileCard = ({ user }: UserProfileCardProps) => {
	return (
		<Card className="bg-background">
			<CardContent className="space-y-5">
				<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
					Profile
				</p>

				<div className="flex items-center gap-6">
					<Avatar className="size-28 shrink-0">
						<AvatarImage
							src={user.profilePictureUrl ?? undefined}
							alt={user.name}
						/>
						<AvatarFallback className="text-2xl font-medium">
							{getInitials(user.name)}
						</AvatarFallback>
					</Avatar>

					<dl className="grid min-w-0 flex-1 divide-y divide-border text-sm">
						<ProfileInfoRow
							label="Email"
							value={user.email}
							valueClassName="truncate"
						/>
						<ProfileInfoRow
							label="Provider"
							value={user.provider}
							valueClassName="capitalize"
						/>
						<ProfileInfoRow
							label="Verified"
							value={user.isVerified ? "Yes" : "No"}
						/>
						<ProfileInfoRow label="Joined" value={formatDate(user.createdAt)} />
						<ProfileInfoRow
							label="Last updated"
							value={formatDate(user.updatedAt)}
						/>
					</dl>
				</div>
			</CardContent>
		</Card>
	);
};

export default UserProfileCard;
