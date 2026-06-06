//* src/components/settings/SecurityTab.tsx

import { KeyRound } from "lucide-react";
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
 * Security settings tab — change password.
 * All controls are placeholder until backend endpoints are available.
 */
const SecurityTab = () => {
	return (
		<div className="space-y-6">
			{/* Change password */}
			<Card className="bg-background">
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
		</div>
	);
};

export default SecurityTab;
