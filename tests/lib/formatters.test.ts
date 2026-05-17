//* tests/lib/formatters.test.ts

import { describe, it, expect } from "vitest";
import { pluralize } from "@/lib/formatters";

describe("pluralize", () => {
	it("uses singular form when count is 1", () => {
		expect(pluralize(1, "file")).toBe("1 file");
	});

	it("uses plural form when count is not 1", () => {
		expect(pluralize(2, "file")).toBe("2 files");
	});
});
