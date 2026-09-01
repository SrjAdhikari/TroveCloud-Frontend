//* tests/setup.ts

import "@testing-library/jest-dom/vitest";
import { configure } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import server from "./server";

// findBy* defaults to a 1s deadline, which assumes a fast machine. On a
// loaded box or a shared CI runner, render + MSW round-trip can exceed it
// and fail a correct test. It only elapses on failure, so passing tests
// pay nothing.
configure({ asyncUtilTimeout: 5000 });

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

	// SidebarProvider (and other Radix layout primitives) rely on
	// ResizeObserver, which jsdom doesn't provide.
	if (!window.ResizeObserver) {
		window.ResizeObserver = class ResizeObserver {
			observe() {}
			unobserve() {}
			disconnect() {}
		};
	}
}

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
