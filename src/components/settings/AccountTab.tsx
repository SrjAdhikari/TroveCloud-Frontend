//* src/components/settings/AccountTab.tsx

import { AlertTriangle, Trash2, ShieldOff, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

/**
 * Account settings tab — data export and danger zone actions.
 * All actions are placeholder until backend endpoints are available.
 */
const AccountTab = () => {
	return (
		<div className="space-y-6">
			{/* Export data */}
			<Card className="bg-background">
				<CardHeader>
					<CardTitle className="text-base flex items-center gap-2">
						<Download className="size-4" />
						Export your data
					</CardTitle>

					<CardDescription>
						Download a copy of all your files and account data stored on
						TroveCloud.
					</CardDescription>
				</CardHeader>

				<CardContent>
					<div className="flex items-center gap-3">
						<Button variant="outline" disabled className="cursor-not-allowed">
							Request export
						</Button>

						<p className="text-xs text-muted-foreground">Coming soon</p>
					</div>
				</CardContent>
			</Card>

			{/* Danger zone */}
			<Card className="border-destructive/30 bg-background">
				<CardHeader>
					<CardTitle className="text-base flex items-center gap-2 text-destructive">
						<AlertTriangle className="size-4" />
						Danger zone
					</CardTitle>

					<CardDescription>
						These actions are irreversible. Please proceed with caution.
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-4">
					{/* Disable account */}
					<div className="flex items-center justify-between rounded-lg border border-destructive/20 p-4">
						<div className="flex-1 mr-4">
							<div className="flex items-center gap-2">
								<ShieldOff className="size-4 text-muted-foreground" />
								<p className="text-sm font-medium">Disable account</p>
							</div>

							<p className="mt-1 text-xs text-muted-foreground">
								Temporarily disable your account. You can re-enable it anytime
								by logging back in.
							</p>
						</div>

						<Button
							variant="outline"
							size="sm"
							disabled
							className="cursor-not-allowed shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
						>
							Disable
						</Button>
					</div>

					{/* Delete account */}
					<div className="flex items-center justify-between rounded-lg border border-destructive/20 p-4">
						<div className="flex-1 mr-4">
							<div className="flex items-center gap-2">
								<Trash2 className="size-4 text-destructive" />
								<p className="text-sm font-medium text-destructive">
									Delete account
								</p>
							</div>

							<p className="mt-1 text-xs text-muted-foreground">
								Permanently delete your account and all associated data. This
								action cannot be undone.
							</p>
						</div>

						<Button
							variant="destructive"
							size="sm"
							disabled
							className="cursor-not-allowed shrink-0"
						>
							Delete
						</Button>
					</div>

					<p className="text-xs text-muted-foreground">
						Account actions coming soon.
					</p>
				</CardContent>
			</Card>
		</div>
	);
};

export default AccountTab;
