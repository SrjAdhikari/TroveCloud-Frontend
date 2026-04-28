//* src/main.tsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";

import Toaster from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import queryClient from "@/config/queryClient";
import App from "@/App";
import "./index.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
if (!GOOGLE_CLIENT_ID) {
	throw new Error("VITE_GOOGLE_CLIENT_ID is not defined in .env file");
}

/**
 * App entry point — sets up global providers and renders the app.
 * Providers: React Query (server state), BrowserRouter (routing), Sonner
 * (toasts), Google OAuth (sign-in with Google).
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
