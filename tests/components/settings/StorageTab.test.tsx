//* tests/components/settings/StorageTab.test.tsx

import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";

import { renderWithProviders } from "../../lib/render";
import server from "../../server";
import { API_BASE_URL } from "@/lib/constants";
import StorageTab from "@/components/settings/StorageTab";

const mockStorage = (body: Record<string, unknown>, status = 200) =>
	server.use(
		http.get(`${API_BASE_URL}/storage/usage`, () =>
			HttpResponse.json(body, { status }),
		),
	);

describe("StorageTab", () => {
	it("renders real usage figures and the category breakdown", async () => {
		mockStorage({
			success: true,
			data: {
				used: 575703552,
				total: 1000000000,
				breakdown: [
					{ category: "Documents", size: 314572800, icon: "file-text" },
					{ category: "Images", size: 209715200, icon: "image" },
				],
			},
		});

		renderWithProviders(<StorageTab />);

		expect(await screen.findByText("575.7 MB")).toBeInTheDocument();
		expect(screen.getByText("Documents")).toBeInTheDocument();
		expect(screen.getByText("Images")).toBeInTheDocument();
		expect(
			screen.getByText(/42% of your storage is available/i),
		).toBeInTheDocument();
	});

	it("shows an empty-state message when the user has no files", async () => {
		mockStorage({
			success: true,
			data: { used: 0, total: 1000000000, breakdown: [] },
		});

		renderWithProviders(<StorageTab />);

		expect(await screen.findByText(/no files yet/i)).toBeInTheDocument();
		expect(
			screen.getByText(/100% of your storage is available/i),
		).toBeInTheDocument();
	});

	it("colors the usage bar with the danger token when nearly full", async () => {
		mockStorage({
			success: true,
			data: { used: 950000000, total: 1000000000, breakdown: [] },
		});

		const { container } = renderWithProviders(<StorageTab />);

		await screen.findByText(/5% of your storage is available/i);
		expect(container.querySelector(".bg-danger")).toBeInTheDocument();
		expect(container.querySelector(".bg-primary")).not.toBeInTheDocument();
	});

	it("shows an error message when the request fails", async () => {
		// 500 → NETWORK_ERROR (not an eviction code), so the inline banner renders.
		// A real 401 would redirect via the axios interceptor before this renders.
		mockStorage({ status: "error" }, 500);

		renderWithProviders(<StorageTab />);

		expect(
			await screen.findByText(/unable to load your storage usage/i),
		).toBeInTheDocument();
	});
});
