//* src/lib/toast.ts

import { toast as sonner } from "sonner";

type PromiseMessages<T> = {
	loading: string;
	success: string | ((data: T) => string);
	error: string | ((err: unknown) => string);
};

/** Success message that closes after 3 seconds. */
const success = (message: string) =>
	sonner.success(message, { duration: 3000 });

/** Success message with an Undo button that stays for 8 seconds. */
const undo = (message: string, onClick: () => void, label = "Undo") =>
	sonner.success(message, {
		duration: 8000,
		action: { label, onClick },
	});

/** Neutral message that closes after 3 seconds. */
const info = (message: string) => sonner.info(message, { duration: 3000 });

/** Warning that closes after 5 seconds. */
const warning = (message: string) =>
	sonner.warning(message, { duration: 5000 });

/**
 * For unexpected errors (server down, no connection, session expired).
 * Stays until the user closes it, unless you pass a `duration`.
 */
const error = (
	message = "Something went wrong. Please try again.",
	duration: number = Infinity,
) => sonner.error(message, { duration });

/** Shows loading, then success or error, when the promise finishes. */
const promise = <T>(p: Promise<T>, messages: PromiseMessages<T>) =>
	sonner.promise(p, messages);

/** Closes one toast by `id`, or all of them if no `id` is given. */
const dismiss = (id?: number | string) => sonner.dismiss(id);

/**
 * Use this instead of importing sonner's `toast` directly, so toast settings
 * can be changed in one place.
 */
const toast = { success, undo, info, warning, error, promise, dismiss };

export default toast;
