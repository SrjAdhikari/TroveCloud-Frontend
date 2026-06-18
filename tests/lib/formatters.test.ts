//* tests/lib/formatters.test.ts

import { describe, it, expect } from "vitest";
import { pluralize, formatBytes } from "@/lib/formatters";

describe("pluralize", () => {
	it("uses singular form when count is 1", () => {
		expect(pluralize(1, "file")).toBe("1 file");
	});

	it("uses plural form when count is not 1", () => {
		expect(pluralize(2, "file")).toBe("2 files");
	});
});

describe("formatBytes", () => {
	it("returns '0 B' for zero, negative, or non-finite input", () => {
		expect(formatBytes(0)).toBe("0 B");
		expect(formatBytes(-100)).toBe("0 B");
		expect(formatBytes(NaN)).toBe("0 B");
	});

	it("formats using decimal (1000-based) units", () => {
		expect(formatBytes(1000)).toBe("1 KB");
		expect(formatBytes(1_000_000_000)).toBe("1 GB");
	});

	it("keeps one decimal place for non-whole values", () => {
		expect(formatBytes(575_703_552)).toBe("575.7 MB");
		expect(formatBytes(2_500_000_000)).toBe("2.5 GB");
	});
});
