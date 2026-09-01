//* tests/hooks/use-mobile.test.ts

import { describe, it, expect, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import useIsMobile from "@/hooks/use-mobile";

const originalWidth = window.innerWidth;

const setViewport = (width: number) => {
	Object.defineProperty(window, "innerWidth", {
		value: width,
		configurable: true,
		writable: true,
	});
};

afterEach(() => setViewport(originalWidth));

/** Records the value returned by every render, not just the settled one. */
const renderValues = () => {
	const seen: boolean[] = [];
	renderHook(() => {
		const value = useIsMobile();
		seen.push(value);
		return value;
	});
	return seen;
};

describe("useIsMobile", () => {
	it("reports mobile on the very first render, with no desktop flash", () => {
		setViewport(800);
		expect(renderValues()[0]).toBe(true);
	});

	it("reports desktop at and above the 1024px breakpoint", () => {
		setViewport(1024);
		expect(renderValues()[0]).toBe(false);
	});
});
