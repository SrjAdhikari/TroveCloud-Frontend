//* src/components/settings/SecurityTab.tsx

import { KeyRound } from "lucide-react";

import ChangePasswordForm from "@/components/settings/ChangePasswordForm";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useCurrentUser } from "@/hooks/useAuth";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

/**
 * Names of the sign-in providers that manage the password instead of us.
 * Every non-email provider must be listed, so adding a new one without a
 * name here is a type error.
 */
const OAUTH_PROVIDER_NAMES = {
	google: "Google",
	github: "GitHub",
} as const;

/**
 * Security tab: change password. Google and GitHub accounts have no password
 * here, so they see a note instead of the form. An unknown provider also gets
 * no form, just to be safe.
 */
const SecurityTab = () => {
	const { data: userResponse } = useCurrentUser();
	const provider = userResponse?.data.provider;
	const oauthProviderName =
		provider && provider !== "email" ? OAUTH_PROVIDER_NAMES[provider] : null;

	return (
		<div className="space-y-6">
			<Card className="bg-background">
				<CardHeader>
					<CardTitle className="text-base flex items-center gap-2">
						<KeyRound className="size-4" />
						Change password
					</CardTitle>
					<CardDescription>
						{oauthProviderName
							? `Your password is managed by ${oauthProviderName}.`
							: "Update your password to keep your account secure."}
					</CardDescription>
				</CardHeader>

				<CardContent>
					{oauthProviderName && (
						<p className="max-w-md text-sm text-muted-foreground">
							You signed in with {oauthProviderName}, so there&apos;s no
							TroveCloud password to change. Manage your password from your{" "}
							{oauthProviderName} account.
						</p>
					)}

					{provider === "email" && <ChangePasswordForm />}

					{!provider && <LoadingSpinner />}
				</CardContent>
			</Card>
		</div>
	);
};

export default SecurityTab;
