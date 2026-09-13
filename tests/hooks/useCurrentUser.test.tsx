//* tests/hooks/useCurrentUser.test.tsx

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { QueryClient } from "@tanstack/react-query";

import { renderWithProviders } from "../lib/render";
import server from "../server";
import { API_BASE_URL } from "@/lib/constants";
import { useCurrentUser } from "@/hooks/useAuth";

const Probe = () => {
	const { data } = useCurrentUser();
	return <span>{data?.data.name ?? "loading"}</span>;
};

let hits = 0;

beforeEach(() => {
	hits = 0;
	vi.useFakeTimers({ shouldAdvanceTime: true });
	server.use(
		http.get(`${API_BASE_URL}/auth/me`, () => {
			hits += 1;
			return HttpResponse.json({
				success: true,
				message: "ok",
				data: { name: "Ada Lovelace" },
			});
		}),
	);
});

afterEach(() => {
	vi.useRealTimers();
});

describe("useCurrentUser staleTime", () => {
	it("serves the cached user across remounts inside the avatar URL window", async () => {
		// gcTime pinned so an unmounted query is never evicted — otherwise the
		// default 5-minute collection, not staleTime, is what drives the refetch.
		const client = new QueryClient({
			defaultOptions: { queries: { retry: false, gcTime: Infinity } },
		});

		const first = renderWithProviders(<Probe />, { client });
		expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
		first.unmount();

		vi.advanceTimersByTime(10 * 60 * 1000);

		renderWithProviders(<Probe />, { client });
		expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
		expect(hits).toBe(1);
	});

	it("refetches once the presigned profilePictureUrl has expired", async () => {
		// gcTime pinned so an unmounted query is never evicted — otherwise the
		// default 5-minute collection, not staleTime, is what drives the refetch.
		const client = new QueryClient({
			defaultOptions: { queries: { retry: false, gcTime: Infinity } },
		});

		const first = renderWithProviders(<Probe />, { client });
		expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
		first.unmount();

		// profilePictureUrl is signed for one hour; past the staleTime window the
		// cached user holds a dead URL, so a remount must go back to the server.
		vi.advanceTimersByTime(50 * 60 * 1000);

		renderWithProviders(<Probe />, { client });
		await vi.waitFor(() => expect(hits).toBe(2));
	});
});
