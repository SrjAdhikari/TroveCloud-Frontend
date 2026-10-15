//* src/components/auth/GitHubSignInButton.tsx

import GitHubIcon from "@/components/icons/GitHubIcon";
import { buildAuthorizeUrl, generateState } from "@/lib/githubOAuth";

interface GitHubSignInButtonProps {
	disabled?: boolean;
	label?: string;
}

/**
 * Saves a one-time code, then sends the user to GitHub to sign in. GitHub
 * sends them back to `/auth/github/callback`, which finishes the sign-in.
 */
const GitHubSignInButton = ({
	disabled = false,
	label = "Continue with GitHub",
}: GitHubSignInButtonProps) => {
	const handleClick = () => {
		const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
		if (!clientId) return;

		const state = generateState();
		window.location.assign(buildAuthorizeUrl(clientId, state));
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			disabled={disabled}
			className="w-full h-11 flex items-center justify-center gap-3 rounded-lg border border-border bg-background text-base font-medium text-foreground hover:bg-muted transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
		>
			<GitHubIcon className="size-5" />
			<span>{label}</span>
		</button>
	);
};

export default GitHubSignInButton;
