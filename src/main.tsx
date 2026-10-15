//* src/main.tsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";

import Toaster from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import queryClient from "@/config/queryClient";
import { GOOGLE_CLIENT_ID, GITHUB_CLIENT_ID } from "@/lib/constants";

import App from "@/App";
import "./index.css";

if (!GOOGLE_CLIENT_ID || !GITHUB_CLIENT_ID) {
	throw new Error(
		"VITE_GOOGLE_CLIENT_ID or VITE_GITHUB_CLIENT_ID is not defined in .env file",
	);
}

/**
 * Starts the app and wraps it in the shared providers: React Query, the
 * router, toasts, and Google sign-in.
 */
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<TooltipProvider>
					<GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
						<App />
					</GoogleOAuthProvider>
					<Toaster />
				</TooltipProvider>
			</BrowserRouter>
		</QueryClientProvider>
	</StrictMode>,
);
