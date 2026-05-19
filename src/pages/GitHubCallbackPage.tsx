//* src/pages/GitHubCallbackPage.tsx

import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import GitHubIcon from "@/components/icons/GitHubIcon";
import ROUTES from "@/routes/paths";
import useGitHubAuth from "@/hooks/useGitHubAuth";
import { consumeState } from "@/lib/githubOAuth";

const GENERIC_ERROR_MESSAGE =
	"GitHub sign-in failed. Please try again or continue with email.";

/**
 * Landing page for `/auth/github/callback`. GitHub redirects here with one of:
 *   - `?code=...&state=...` (success path)
 *   - `?error=...` (user denied or GitHub rejected)
 *
 * On success: exchanges the code with the backend; GuestRoute auto-redirects
 * to /my-files once the auth query refetches.
 *
 * On any failure: renders an error panel with a "Back to sign in" link.
 */
const GitHubCallbackPage = () => {
	const [params] = useSearchParams();
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	// Prevents StrictMode's double-effect from sending the (single-use)
	// authorization code to the backend twice.
	const handledRef = useRef(false);

	// Stable callback so useGitHubAuth's useCallback-deps don't churn.
	const goToMyFiles = useCallback(() => {
		navigate(ROUTES.MY_FILES, { replace: true });
	}, [navigate]);

	const { handleCode } = useGitHubAuth({ setError, onSuccess: goToMyFiles });

	useEffect(() => {
		if (handledRef.current) return;
		handledRef.current = true;

		const githubError = params.get("error");
		if (githubError) {
			setError(GENERIC_ERROR_MESSAGE);
			return;
		}

		const code = params.get("code");
		const returnedState = params.get("state");
		const expectedState = consumeState();

		if (!code || !returnedState || returnedState !== expectedState) {
			setError(GENERIC_ERROR_MESSAGE);
			return;
		}

		handleCode(code);
	}, [params, handleCode]);

	return (
		<div className="w-full max-w-[400px] flex flex-col items-center text-center">
			{error ? (
				<>
					<div className="size-16 rounded-full bg-danger/10 flex items-center justify-center">
						<AlertCircle className="size-7 text-danger" />
					</div>

					<div className="mt-6 space-y-2">
						<h2 className="font-heading text-lg font-medium">
							Failed to sign in with GitHub
						</h2>
						<p className="text-sm text-muted-foreground">{error}</p>
					</div>

					<Button asChild className="w-full h-11 mt-8">
						<Link to={ROUTES.ROOT}>Back to sign in</Link>
					</Button>
				</>
			) : (
				<>
					<div className="relative size-16">
						<div
							aria-hidden="true"
							className="absolute inset-0 rounded-full border-4 border-purple/15 border-t-purple animate-spin"
						/>

						<div className="absolute inset-0 flex items-center justify-center">
							<GitHubIcon className="size-7 text-foreground" />
						</div>
					</div>

					<h2 className="font-heading text-lg font-medium mt-6">
						Please wait while we set up your account
					</h2>
					<p className="text-sm text-muted-foreground">
						This usually takes a few seconds...
					</p>
				</>
			)}
		</div>
	);
};

export default GitHubCallbackPage;
