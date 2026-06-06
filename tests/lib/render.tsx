//* tests/lib/render.tsx

import type { ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";

interface WrapperOptions extends Omit<RenderOptions, "wrapper"> {
	initialEntries?: string[];
	client?: QueryClient;
}

/**
 * Renders the given UI inside a MemoryRouter + TooltipProvider. Use for
 * components that render <Link>, call useNavigate / useSearchParams, or
 * mount a shadcn Tooltip anywhere in the tree.
 */
const renderWithRouter = (ui: ReactElement, options: WrapperOptions = {}) => {
	const { initialEntries = ["/"], ...rest } = options;
	return render(
		<MemoryRouter initialEntries={initialEntries}>
			<TooltipProvider>{ui}</TooltipProvider>
		</MemoryRouter>,
		rest,
	);
};

/**
 * Renders inside MemoryRouter + TooltipProvider + a fresh QueryClient
 * (retries disabled so tests fail fast). Use for components that call
 * useQuery / useMutation.
 */
const renderWithProviders = (
	ui: ReactElement,
	options: WrapperOptions = {},
) => {
	const {
		initialEntries = ["/"],
		client = new QueryClient({ defaultOptions: { queries: { retry: false } } }),
		...rest
	} = options;
	return render(
		<MemoryRouter initialEntries={initialEntries}>
			<TooltipProvider>
				<QueryClientProvider client={client}>{ui}</QueryClientProvider>
			</TooltipProvider>
		</MemoryRouter>,
		rest,
	);
};

export { renderWithRouter, renderWithProviders };
