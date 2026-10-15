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
 * Creates a random one-time code, saves it for this tab, and returns it.
 * GitHub sends it back, so we can check the sign-in really started here.
 */
export const generateState = (): string => {
	const state = crypto.randomUUID();
	sessionStorage.setItem(STATE_STORAGE_KEY, state);
	return state;
};

/**
 * Reads the saved code and deletes it. Returns `null` if there is none, e.g.
 * the user opened the callback link directly or reloaded the page.
 */
export const consumeState = (): string | null => {
	const stored = sessionStorage.getItem(STATE_STORAGE_KEY);
	sessionStorage.removeItem(STATE_STORAGE_KEY);
	return stored;
};

/**
 * The page GitHub sends the user back to, on whatever site the app runs on.
 * This URL must also be listed in the GitHub OAuth app settings.
 */
const getRedirectUri = (): string =>
	`${window.location.origin}${ROUTES.GITHUB_CALLBACK}`;

export const buildAuthorizeUrl = (clientId: string, state: string): string => {
	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: getRedirectUri(),
		scope: SCOPE,
		state,
	});
	return `${AUTHORIZE_URL}?${params.toString()}`;
};
