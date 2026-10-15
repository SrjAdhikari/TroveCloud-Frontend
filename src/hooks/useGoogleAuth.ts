//* src/hooks/useGoogleAuth.ts

import { useQueryClient } from "@tanstack/react-query";
import { useGoogleSignIn } from "@/hooks/useAuth";

interface UseGoogleAuthOptions {
	setError: (message: string | null) => void;
	onSuccess?: () => void;
}

/**
 * Errors whose server message is safe to show. Anything else shows the
 * generic message, so users never see raw server errors.
 */
const SHOWABLE_ERROR_CODES = new Set([
	"PROVIDER_MISMATCH",
	"GOOGLE_EMAIL_NOT_VERIFIED",
]);

const GENERIC_ERROR_MESSAGE =
	"Google sign-in failed. Please try again or continue with email.";

const useGoogleAuth = ({ setError, onSuccess }: UseGoogleAuthOptions) => {
	const queryClient = useQueryClient();
	const { mutate, isPending } = useGoogleSignIn();

	// Runs when Google signs the user in; sends Google's token to our server.
	const handleSuccess = (idToken: string) => {
		setError(null);
		mutate(
			{ idToken },
			{
				onSuccess: () => {
					onSuccess?.();
					// Reload the current user so the app moves to /my-files right away.
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

	// Runs when Google's own sign-in fails (popup blocked, user cancelled, etc.).
	const handleError = () => {
		setError(GENERIC_ERROR_MESSAGE);
	};

	return { handleSuccess, handleError, isPending };
};

export default useGoogleAuth;
