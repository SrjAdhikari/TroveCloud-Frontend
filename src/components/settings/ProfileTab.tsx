//* src/components/settings/ProfileTab.tsx

import { Camera, Calendar } from "lucide-react";
import { useCurrentUser } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

/**
 * Extracts up to two initials from a user's name for the avatar fallback.
 */
const getInitials = (name: string) => {
	const parts = name.trim().split(/\s+/);
	if (parts.length >= 2) {
		return (parts[0][0] + parts[1][0]).toUpperCase();
	}
	return name.slice(0, 2).toUpperCase();
};

/**
 * Formats an ISO date string to a readable format (e.g., "April 2026").
 */
const formatJoinDate = (dateStr: string) => {
	const date = new Date(dateStr);
	return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

/**
 * Profile settings tab — displays user info with placeholder edit controls.
 * Name and avatar editing will be functional once backend supports it.
 */
const ProfileTab = () => {
	const { data: userResponse } = useCurrentUser();
	const user = userResponse?.data;

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Profile</CardTitle>
					<CardDescription>
						Your personal information and how others see you on TroveCloud.
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-6">
					{/* Avatar section */}
					<div className="flex items-center gap-5">
						<div className="relative group">
							<Avatar className="size-20">
								<AvatarImage src={user?.profilePicture} alt={user?.name} />
								<AvatarFallback className="text-xl font-medium">
									{user?.name ? getInitials(user.name) : "?"}
								</AvatarFallback>
							</Avatar>

							{/* Upload overlay */}
							<button
								type="button"
								disabled
								className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 cursor-not-allowed"
							>
								<Camera className="size-5 text-white" />
							</button>
						</div>

						<div>
							<p className="text-sm font-medium">{user?.name}</p>
							<p className="text-xs text-muted-foreground">{user?.email}</p>

							<Button
								variant="outline"
								size="sm"
								disabled
								className="mt-3 cursor-not-allowed"
							>
								Upload photo
							</Button>
						</div>
					</div>

					{/* Name */}
					<div className="space-y-2">
						<Label htmlFor="name">Name</Label>
						<Input
							id="name"
							value={user?.name ?? ""}
							disabled
							className="max-w-md"
						/>
						<p className="text-xs text-muted-foreground">
							Name editing coming soon.
						</p>
					</div>

					{/* Email */}
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
							Member since{" "}
							{user?.createdAt ? formatJoinDate(user.createdAt) : "—"}
						</span>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default ProfileTab;
