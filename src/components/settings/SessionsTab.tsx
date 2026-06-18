//* src/components/settings/SessionsTab.tsx

import { useState } from "react";
import { Monitor, Smartphone, Globe, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import LogoutAllDialog from "@/components/settings/LogoutAllDialog";

/**
 * Placeholder session data to preview the active sessions UI.
 * Will be replaced with real data once the backend supports it.
 */
const placeholderSessions = [
	{
		id: 1,
		device: "Chrome on Windows",
		icon: Monitor,
		location: "New York, US",
		lastActive: "Active now",
		current: true,
	},
	{
		id: 2,
		device: "Safari on iPhone",
		icon: Smartphone,
		location: "New York, US",
		lastActive: "2 hours ago",
		current: false,
	},
	{
		id: 3,
		device: "Firefox on macOS",
		icon: Globe,
		location: "San Francisco, US",
		lastActive: "3 days ago",
		current: false,
	},
];

/**
 * Sessions settings tab — active-device list (placeholder until backend
 * support) plus the live "log out of all devices" action.
 */
const SessionsTab = () => {
	const [showLogoutAll, setShowLogoutAll] = useState(false);

	return (
		<div className="space-y-6">
			{/* Active sessions */}
			<Card className="bg-background">
				<CardHeader>
					<CardTitle className="text-base flex items-center gap-2">
						<Monitor className="size-4" />
						Active sessions
					</CardTitle>

					<CardDescription>
						Devices currently logged into your account.
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-3">
					{placeholderSessions.map((session) => {
						const Icon = session.icon;
						return (
							<div
								key={session.id}
								className="flex items-center justify-between rounded-lg border p-3"
							>
								<div className="flex items-center gap-3">
									<div className="flex size-9 items-center justify-center rounded-full bg-muted">
										<Icon className="size-4 text-muted-foreground" />
									</div>

									<div>
										<p className="text-sm font-medium">
											{session.device}
											{session.current && (
												<span className="ml-2 text-xs font-normal text-success">
													This device
												</span>
											)}
										</p>

										<p className="text-xs text-muted-foreground">
											{session.location} &middot; {session.lastActive}
										</p>
									</div>
								</div>

								{!session.current && (
									<Button
										variant="ghost"
										size="sm"
										disabled
										className="cursor-not-allowed text-xs text-destructive hover:text-destructive"
									>
										Revoke
									</Button>
								)}
							</div>
						);
					})}

					<p className="pt-1 text-xs text-muted-foreground">
						Session management coming soon.
					</p>
				</CardContent>
			</Card>

			{/* Log out of all devices */}
			<Card className="bg-background">
				<CardHeader>
					<CardTitle className="text-base flex items-center gap-2">
						<LogOut className="size-4" />
						Log out of all devices
					</CardTitle>

					<CardDescription>
						Sign out of every device, including this one. You'll need to sign in
						again everywhere.
					</CardDescription>
				</CardHeader>

				<CardContent>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setShowLogoutAll(true)}
						className="cursor-pointer border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
					>
						Log out of all devices
					</Button>
				</CardContent>
			</Card>

			{showLogoutAll && (
				<LogoutAllDialog onClose={() => setShowLogoutAll(false)} />
			)}
		</div>
	);
};

export default SessionsTab;
