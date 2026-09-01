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
 * Display names for the providers that own the password instead of us. Keyed
 * by every non-email provider, so adding one to `AuthProvider` fails to
 * compile here rather than silently showing them a password form.
 */
const OAUTH_PROVIDER_NAMES = {
	google: "Google",
	github: "GitHub",
} as const;

/**
 * Security settings tab — change password.
 *
 * OAuth accounts have no TroveCloud password (the backend rejects them with
 * PROVIDER_MISMATCH), so the card explains that instead of rendering a form
 * that could never succeed. An unknown provider withholds the form rather
 * than defaulting to it — ProtectedRoute makes that unreachable today, but
 * this component shouldn't depend on a guard two levels up.
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
