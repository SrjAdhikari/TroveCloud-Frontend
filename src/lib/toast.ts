//* src/lib/toast.ts

import { toast as sonner } from "sonner";

type PromiseMessages<T> = {
	loading: string;
	success: string | ((data: T) => string);
	error: string | ((err: unknown) => string);
};

/**
 * Standard success toast — auto-dismisses after 3 seconds.
 * Use for non-reversible confirmations (download started, link copied, 2FA enabled).
 */
const success = (message: string) =>
	sonner.success(message, { duration: 3000 });

/**
 * Success toast with an Undo action button. The 8-second window gives the
 * user time to react before a destructive action becomes permanent.
 * Use for: move-to-trash, remove-from-favorites, revoke share access.
 */
const undo = (message: string, onClick: () => void, label = "Undo") =>
	sonner.success(message, {
		duration: 8000,
		action: { label, onClick },
	});

/** Neutral info toast — clipboard, contextual hints. 3-second auto-dismiss. */
const info = (message: string) => sonner.info(message, { duration: 3000 });

/** Non-blocking warning — auto-dismisses after 5 seconds. */
const warning = (message: string) =>
	sonner.warning(message, { duration: 5000 });

/**
 * Unexpected server error (5xx, network failure, expired session).
 * Defaults to persistent (Infinity) so the user can't miss it.
 * Pass `duration` to override for less critical cases.
 */
const error = (
	message = "Something went wrong. Please try again.",
	duration: number = Infinity,
) => sonner.error(message, { duration });

/**
 * Async-aware toast — transitions through loading → success or error
 * automatically based on the promise resolution. Useful for share-link
 * generation, bulk restores, etc.
 */
const promise = <T>(p: Promise<T>, messages: PromiseMessages<T>) =>
	sonner.promise(p, messages);

/**
 * Dismisses toasts.
 * Pass a toast id to dismiss a specific one;
 * omit to dismiss all currently visible toasts.
 */
const dismiss = (id?: number | string) => sonner.dismiss(id);

/**
 * Centralised toast utility.
 * Always use this — never import sonner's `toast` directly in components.
 * Centralisation lets us change behavior (durations, position, variant tints) globally in one place.
 */
const toast = { success, undo, info, warning, error, promise, dismiss };

export default toast;
