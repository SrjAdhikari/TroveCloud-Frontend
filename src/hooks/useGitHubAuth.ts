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
 * Backend error codes whose `message` is curated for direct user display.
 * Anything outside this set falls back to GENERIC_ERROR_MESSAGE so we never
 * leak transport / 500 / unknown error strings into the UI.
 */
const SHOWABLE_ERROR_CODES = new Set([
	"PROVIDER_MISMATCH",
	"GITHUB_EMAIL_NOT_VERIFIED",
]);

const GENERIC_ERROR_MESSAGE =
	"GitHub sign-in failed. Please try again or continue with email.";

/**
 * Encapsulates the GitHub sign-in flow used by the callback page —
 * mutation invocation, query invalidation, and standardized error messaging.
 *
 * Uses `mutateAsync` + `try`/`catch` (instead of scoped `mutate(vars, {
 * onSuccess, onError })` callbacks) because this hook is invoked from a
 * `useEffect` that re-renders many times before the response lands —
 * scoped callbacks can be lost in that churn with React Query v5.
 * Awaiting a real Promise can't be lost.
 *
 * Returns:
 * - `handleCode(code)` — call once the callback URL has been parsed and the CSRF state verified.
 * - `isPending` — true while the backend exchange is in flight.
 */
const useGitHubAuth = ({ setError, onSuccess }: UseGitHubAuthOptions) => {
	const queryClient = useQueryClient();
	const { mutateAsync, isPending } = useGitHubSignIn();

	// Memoized to prevent callback page's useEffect from re-running on every render.
	const handleCode = useCallback(
		async (code: string) => {
			setError(null);
			try {
				await mutateAsync({ code });
				onSuccess?.();

				// Invalidate cached auth state so GuestRoute refetches and redirects to /my-files.
				// useCurrentUser uses staleTime: Infinity, so manual invalidation is required.
				queryClient.invalidateQueries({ queryKey: ["currentUser"] });
			} catch (err) {
				// Axios interceptor guarantees ApiError shape on rejection.
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
