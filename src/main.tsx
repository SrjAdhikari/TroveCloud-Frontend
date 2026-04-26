//* src/main.tsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";

import Toaster from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
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
				<TooltipProvider>
					<App />
					<Toaster />
				</TooltipProvider>
			</BrowserRouter>
		</QueryClientProvider>
	</StrictMode>,
);
