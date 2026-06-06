//* tests/schemas/profile.schema.test.ts

import { describe, it, expect } from "vitest";
import { profileNameSchema } from "@/schemas/profile.schema";

describe("profileNameSchema", () => {
	it("accepts a valid name", () => {
		const result = profileNameSchema.safeParse({ name: "Ada Lovelace" });
		expect(result.success).toBe(true);
	});

	it("trims surrounding whitespace", () => {
		const result = profileNameSchema.safeParse({ name: "  Ada  " });
		expect(result.success).toBe(true);
		if (result.success) expect(result.data.name).toBe("Ada");
	});

	it("rejects an empty name", () => {
		expect(profileNameSchema.safeParse({ name: "" }).success).toBe(false);
	});

	it("rejects a name shorter than 3 characters", () => {
		expect(profileNameSchema.safeParse({ name: "Ad" }).success).toBe(false);
	});

	it("rejects a name longer than 50 characters", () => {
		expect(profileNameSchema.safeParse({ name: "x".repeat(51) }).success).toBe(
			false,
		);
	});
});
