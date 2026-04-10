//* src/main.tsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import queryClient from "@/config/queryClient";
import App from "@/App";
import "./index.css";

/**
 * App entry point — sets up global providers and renders the app.
 * Providers: React Query (server state), BrowserRouter (routing), Sonner (toasts).
 */
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<App />
				<Toaster
					position="top-center"
					closeButton={true}
					duration={3000}
					toastOptions={{
						classNames: {
							success:
								"!bg-white !text-green-600 !border !border-zinc-200 dark:!bg-popover dark:!text-green-500 dark:!border-transparent",
							error:
								"!bg-white !text-red-600 !border !border-zinc-200 dark:!bg-popover dark:!text-red-500 dark:!border-transparent",
							info: "!bg-white !text-blue-600 !border !border-zinc-200 dark:!bg-popover dark:!text-blue-500 dark:!border-transparent",
							warning:
								"!bg-white !text-yellow-600 !border !border-zinc-200 dark:!bg-popover dark:!text-yellow-500 dark:!border-transparent",
						},
					}}
				/>
			</BrowserRouter>
		</QueryClientProvider>
	</StrictMode>,
);
