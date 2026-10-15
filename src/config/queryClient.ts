//* src/config/queryClient.ts

import { QueryClient } from "@tanstack/react-query";
import type { ApiError } from "@/types/api.types";

/** Makes ApiError the error type for all queries, so `error.code` is typed. */
declare module "@tanstack/react-query" {
	interface Register {
		defaultError: ApiError;
	}
}

/**
 * Shared React Query client. Failed requests aren't retried (we handle
 * errors ourselves), and switching tabs doesn't reload data.
 */
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
			refetchOnWindowFocus: false,
		},
		mutations: {
			retry: false,
		},
	},
});

export default queryClient;
