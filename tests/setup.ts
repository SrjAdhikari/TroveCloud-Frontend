//* tests/setup.ts

import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import server from "./server";

// jsdom doesn't implement these Pointer Events / scroll APIs that Radix
// primitives (Select, Dialog, etc.) call internally. Polyfilling them as
// no-ops keeps Radix from throwing during interaction tests.
if (typeof window !== "undefined") {
	if (!Element.prototype.hasPointerCapture) {
		Element.prototype.hasPointerCapture = () => false;
	}

	if (!Element.prototype.releasePointerCapture) {
		Element.prototype.releasePointerCapture = () => {};
	}

	if (!Element.prototype.scrollIntoView) {
		Element.prototype.scrollIntoView = () => {};
	}

	if (!window.matchMedia) {
		window.matchMedia = (query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		});
	}
}

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
