//* src/pages/GitHubCallbackPage.tsx

import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import GitHubIcon from "@/components/icons/GitHubIcon";
import ROUTES from "@/routes/paths";
import useGitHubAuth from "@/hooks/useGitHubAuth";
import { consumeState } from "@/lib/githubOAuth";

const GENERIC_ERROR_MESSAGE =
	"GitHub sign-in failed. Please try again or continue with email.";

type Validation =
	| { kind: "error"; message: string }
	| { kind: "code"; code: string };

/**
 * Reads the callback URL once and decides whether to surface an error or
 * forward the code to the backend exchange. `consumeState()` clears the
 * CSRF token from sessionStorage as a side effect — call exactly once.
 */
const validateCallback = (params: URLSearchParams): Validation => {
	const githubError = params.get("error");
	if (githubError) {
		return { kind: "error", message: GENERIC_ERROR_MESSAGE };
	}

	const code = params.get("code");
	const returnedState = params.get("state");
	const expectedState = consumeState();

	if (!code || !returnedState || returnedState !== expectedState) {
		return { kind: "error", message: GENERIC_ERROR_MESSAGE };
	}

	return { kind: "code", code };
};

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
	const navigate = useNavigate();

	// Validate once on mount via useState's lazy initializer. `consumeState()`
	// removes the CSRF token from sessionStorage; running it inside the
	// initializer means it fires exactly once per component instance and the
	// result feeds both `error` initial state and the effect below.
	const [validation] = useState<Validation>(() => validateCallback(params));
	const [error, setError] = useState<string | null>(() =>
		validation.kind === "error" ? validation.message : null,
	);

	// Stable callback so useGitHubAuth's useCallback deps don't churn.
	const goToMyFiles = useCallback(() => {
		navigate(ROUTES.MY_FILES, { replace: true });
	}, [navigate]);

	const { handleCode } = useGitHubAuth({ setError, onSuccess: goToMyFiles });

	useEffect(() => {
		if (validation.kind === "code") {
			handleCode(validation.code);
		}
	}, [validation, handleCode]);

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
