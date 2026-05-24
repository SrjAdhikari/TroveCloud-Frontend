//* tests/hooks/usePostLogout.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import toast from "@/lib/toast";
import usePostLogout from "@/hooks/usePostLogout";

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
	const actual = await importOriginal<typeof import("react-router")>();
	return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("@/lib/toast", () => ({
	default: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}));

const makeWrapper = (client: QueryClient) => {
	return ({ children }: { children: ReactNode }) => (
		<MemoryRouter>
			<QueryClientProvider client={client}>{children}</QueryClientProvider>
		</MemoryRouter>
	);
};

describe("usePostLogout", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("clears auth caches, redirects to root, and fires a success toast", () => {
		const client = new QueryClient();
		client.setQueryData(["currentUser"], { id: "1" });
		client.setQueryData(["directory"], { items: [] });

		const { result } = renderHook(() => usePostLogout(), {
			wrapper: makeWrapper(client),
		});

		result.current("Logged out successfully");

		expect(client.getQueryData(["currentUser"])).toBeUndefined();
		expect(client.getQueryData(["directory"])).toBeUndefined();
		expect(mockNavigate).toHaveBeenCalledWith("/");
		expect(toast.success).toHaveBeenCalledWith("Logged out successfully");
	});
});
