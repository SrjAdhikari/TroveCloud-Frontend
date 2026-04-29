//* src/lib/githubOAuth.ts

import ROUTES from "@/routes/paths";

/**
 * GitHub OAuth helpers — authorize URL builder + CSRF state handling.
 *
 * Flow:
 *   1. Button click → `generateState()` stashes a random nonce in
 *      sessionStorage and returns it.
 *   2. Browser redirected to `buildAuthorizeUrl(...)`.
 *   3. GitHub redirects back to `/auth/github/callback?code=...&state=...`.
 *   4. Callback page calls `consumeState()` and compares with the returned
 *      `state` query param to defend against forged redirects.
 */

const SCOPE = "read:user user:email";
const STATE_STORAGE_KEY = "github_oauth_state";
const AUTHORIZE_URL = "https://github.com/login/oauth/authorize";

/**
 * Generates a cryptographically random CSRF state token, persists it in
 * sessionStorage, and returns it for the authorize URL.
 */
const generateState = (): string => {
	const state = crypto.randomUUID();
	sessionStorage.setItem(STATE_STORAGE_KEY, state);
	return state;
};

/**
 * Reads and clears the stored state. Returns `null` if none was stored
 * (e.g. user navigated directly to the callback URL or reloaded after
 * the state was already consumed).
 */
const consumeState = (): string | null => {
	const stored = sessionStorage.getItem(STATE_STORAGE_KEY);
	sessionStorage.removeItem(STATE_STORAGE_KEY);
	return stored;
};

/**
 * Computes the redirect URI for the current origin — matches whatever
 * dev/staging/prod the app is running on. The same URL must be added to
 * the GitHub OAuth app's "Authorization callback URL" allowlist.
 */
const getRedirectUri = (): string =>
	`${window.location.origin}${ROUTES.GITHUB_CALLBACK}`;

/**
 * Builds the GitHub authorize URL the browser should be redirected to.
 */
const buildAuthorizeUrl = (clientId: string, state: string): string => {
	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: getRedirectUri(),
		scope: SCOPE,
		state,
	});
	return `${AUTHORIZE_URL}?${params.toString()}`;
};

export { generateState, consumeState, buildAuthorizeUrl };
