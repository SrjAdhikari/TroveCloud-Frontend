//* tests/components/dashboard/preview/TextPreview.test.tsx

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";

import server from "../../../server";
import TextPreview from "@/components/dashboard/preview/TextPreview";

const signedUrl = "https://r2.example.com/notes.txt?X-Amz-Signature=abc";

afterEach(() => {
	vi.restoreAllMocks();
});

describe("TextPreview", () => {
	it("reads the file with bare fetch so no cookies reach Cloudflare", async () => {
		server.use(http.get(signedUrl, () => HttpResponse.text("hello world")));
		const fetchSpy = vi.spyOn(globalThis, "fetch");

		render(<TextPreview url={signedUrl} />);

		expect(await screen.findByText("hello world")).toBeInTheDocument();

		// axios uses the XHR adapter in jsdom, so a fetch call for this URL is
		// proof the request did not go through the authenticated client.
		const calledSignedUrl = fetchSpy.mock.calls.some(
			([input]) => String(input) === signedUrl,
		);
		expect(calledSignedUrl).toBe(true);
	});

	it("shows a failure message when the signed URL is rejected", async () => {
		server.use(
			http.get(signedUrl, () => new HttpResponse(null, { status: 403 })),
		);

		render(<TextPreview url={signedUrl} />);

		expect(
			await screen.findByText(/failed to load file content/i),
		).toBeInTheDocument();
	});
});
