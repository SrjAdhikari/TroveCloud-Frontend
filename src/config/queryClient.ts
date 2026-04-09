//* src/config/queryClient.ts

import { QueryClient } from "@tanstack/react-query";
import type { ApiError } from "@/types/api.types";

/**
 * Register ApiError as the default error type for all queries and mutations.
 * This replaces the default `Error` type so `error.code` is typed everywhere.
 */
declare module "@tanstack/react-query" {
	interface Register {
		defaultError: ApiError;
	}
}

/**
 * Shared TanStack Query client used by the QueryClientProvider in App.tsx.
 * - retry: false — failed requests won't auto-retry (we handle errors explicitly).
 * - refetchOnWindowFocus: false — prevents unexpected refetches when switching tabs.
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
