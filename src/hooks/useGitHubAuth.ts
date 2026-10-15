//* src/hooks/useGitHubAuth.ts

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGitHubSignIn } from "@/hooks/useAuth";
import type { ApiError } from "@/types/api.types";

interface UseGitHubAuthOptions {
	setError: (message: string | null) => void;
	onSuccess?: () => void;
}

/**
 * Errors whose server message is safe to show. Anything else shows the
 * generic message, so users never see raw server errors.
 */
const SHOWABLE_ERROR_CODES = new Set([
	"PROVIDER_MISMATCH",
	"GITHUB_EMAIL_NOT_VERIFIED",
]);

const GENERIC_ERROR_MESSAGE =
	"GitHub sign-in failed. Please try again or continue with email.";

/**
 * Uses `mutateAsync` with try/catch instead of `mutate` callbacks. This runs
 * inside a `useEffect` that re-renders a lot before the reply arrives, and
 * React Query can lose `mutate` callbacks then. An awaited call can't be lost.
 */
const useGitHubAuth = ({ setError, onSuccess }: UseGitHubAuthOptions) => {
	const queryClient = useQueryClient();
	const { mutateAsync, isPending } = useGitHubSignIn();

	// Stays the same between renders so the callback page's effect doesn't re-run.
	const handleCode = useCallback(
		async (code: string) => {
			setError(null);
			try {
				await mutateAsync({ code });

				// Reload the current user before leaving this page, so the next page
				// sees them as signed in instead of the old signed-out result.
				await queryClient.refetchQueries({ queryKey: ["currentUser"] });

				onSuccess?.();
			} catch (err) {
				// Our Axios setup turns every failed request into an ApiError.
				const apiErr = err as ApiError;
				setError(
					SHOWABLE_ERROR_CODES.has(apiErr.code)
						? apiErr.message
						: GENERIC_ERROR_MESSAGE,
				);
			}
		},
		[setError, onSuccess, mutateAsync, queryClient],
	);

	return { handleCode, isPending };
};

export default useGitHubAuth;
