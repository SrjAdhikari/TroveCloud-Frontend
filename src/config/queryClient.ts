//* src/config/queryClient.ts

import { QueryClient } from "@tanstack/react-query";

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
