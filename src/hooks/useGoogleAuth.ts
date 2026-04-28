//* src/hooks/useGoogleAuth.ts

import { useQueryClient } from "@tanstack/react-query";
import { useGoogleSignIn } from "@/hooks/useAuth";

interface UseGoogleAuthOptions {
	setError: (message: string | null) => void;
	onSuccess?: () => void;
}

/**
 * Backend error codes whose `message` is curated for direct user display.
 * Anything outside this set falls back to GENERIC_ERROR_MESSAGE so we never
 * leak transport / 500 / unknown error strings into the UI.
 */
const SHOWABLE_ERROR_CODES = new Set([
	"PROVIDER_MISMATCH",
	"GOOGLE_EMAIL_NOT_VERIFIED",
]);

const GENERIC_ERROR_MESSAGE =
	"Google sign-in failed. Please try again or continue with email.";

/**
 * Encapsulates the Google sign-in flow shared by Login and Register pages —
 * mutation invocation, query invalidation, and standardized error messaging.
 *
 * Returns three pieces:
 * - `handleSuccess(idToken)` — pass to `<GoogleSignInButton onSuccess={...}>`
 * - `handleError()` — pass to `<GoogleSignInButton onError={...}>`
 * - `isPending` — for disabling the email/password submit while Google is in flight
 */
const useGoogleAuth = ({ setError, onSuccess }: UseGoogleAuthOptions) => {
	const queryClient = useQueryClient();
	const { mutate, isPending } = useGoogleSignIn();

	// Called when Google returns an ID token; posts it to /auth/google.
	const handleSuccess = (idToken: string) => {
		setError(null);
		mutate(
			{ idToken },
			{
				onSuccess: () => {
					onSuccess?.();
					// Invalidate cached auth state so GuestRoute refetches and redirects to /my-files.
					// useCurrentUser uses staleTime: Infinity, so manual invalidation is required.
					queryClient.invalidateQueries({ queryKey: ["currentUser"] });
				},
				onError: (error) => {
					setError(
						SHOWABLE_ERROR_CODES.has(error.code)
							? error.message
							: GENERIC_ERROR_MESSAGE,
					);
				},
			},
		);
	};

	// Called when Google's flow itself fails (popup blocked, user canceled, etc.).
	const handleError = () => {
		setError(GENERIC_ERROR_MESSAGE);
	};

	return { handleSuccess, handleError, isPending };
};

export default useGoogleAuth;
