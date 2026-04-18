//* src/components/settings/SecurityTab.tsx

import { KeyRound, Monitor, Smartphone, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import FormField from "@/components/form/FormField";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

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
 * Security settings tab — change password and view active sessions.
 * All controls are placeholder until backend endpoints are available.
 */
const SecurityTab = () => {
	return (
		<div className="space-y-6">
			{/* Change password */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base flex items-center gap-2">
						<KeyRound className="size-4" />
						Change password
					</CardTitle>
					<CardDescription>
						Update your password to keep your account secure.
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-5">
					<div className="max-w-md">
						<FormField
							id="current-password"
							label="Current password"
							type="password"
							placeholder="Enter current password"
							disabled
						/>
					</div>

					<div className="max-w-md">
						<FormField
							id="new-password"
							label="New password"
							type="password"
							placeholder="Enter new password"
							disabled
						/>
					</div>

					<div className="max-w-md">
						<FormField
							id="confirm-password"
							label="Confirm new password"
							type="password"
							placeholder="Confirm new password"
							disabled
						/>
					</div>

					<div className="flex items-center gap-3">
						<Button disabled className="cursor-not-allowed">
							Update password
						</Button>
						<p className="text-xs text-muted-foreground">Coming soon</p>
					</div>
				</CardContent>
			</Card>

			{/* Active sessions */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base flex items-center gap-2">
						<Monitor className="size-4" />
						Active sessions
					</CardTitle>

					<CardDescription>
						Devices currently logged into your account. You can revoke access
						from any device.
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
												<span className="ml-2 text-xs font-normal text-green-600 dark:text-green-400">
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
		</div>
	);
};

export default SecurityTab;
