//* src/components/settings/ProfileTab.tsx

import { Calendar } from "lucide-react";
import { useCurrentUser } from "@/hooks/useAuth";

import { formatDate } from "@/lib/formatters";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ProfileAvatarUpload from "@/components/settings/ProfileAvatarUpload";
import ProfileNameForm from "@/components/settings/ProfileNameForm";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

/**
 * Profile settings tab — avatar, editable name, read-only email, member-since.
 */
const ProfileTab = () => {
	const { data: userResponse } = useCurrentUser();
	const user = userResponse?.data;

	return (
		<div className="space-y-6">
			<Card className="bg-background">
				<CardHeader>
					<CardTitle className="text-base">Profile</CardTitle>
					<CardDescription>
						Your personal information and how others see you on TroveCloud.
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-6">
					{/* Avatar — upload */}
					{user && <ProfileAvatarUpload user={user} />}

					{/* Name — editable */}
					{user && <ProfileNameForm currentName={user.name} />}

					{/* Email — read-only */}
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							value={user?.email ?? ""}
							disabled
							className="max-w-md"
						/>
						<p className="text-xs text-muted-foreground">
							Email cannot be changed.
						</p>
					</div>

					{/* Member since */}
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Calendar className="size-3.5" />
						<span>
							Member since {user?.createdAt ? formatDate(user.createdAt) : "—"}
						</span>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default ProfileTab;
