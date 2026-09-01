//* tests/schemas/auth.schema.test.ts

import { describe, it, expect } from "vitest";
import {
	registerSchema,
	resetPasswordSchema,
	changePasswordSchema,
} from "@/schemas/auth.schema";

const valid = {
	currentPassword: "OldPass123!",
	newPassword: "NewPass456!",
	confirmPassword: "NewPass456!",
};

describe("changePasswordSchema", () => {
	it("accepts a valid change-password payload", () => {
		expect(changePasswordSchema.safeParse(valid).success).toBe(true);
	});

	it("rejects a confirmPassword that does not match", () => {
		const result = changePasswordSchema.safeParse({
			...valid,
			confirmPassword: "Different789!",
		});
		expect(result.success).toBe(false);
	});

	it("rejects a newPassword that fails the strength rules", () => {
		const result = changePasswordSchema.safeParse({
			...valid,
			newPassword: "weakpass",
			confirmPassword: "weakpass",
		});
		expect(result.success).toBe(false);
	});

	it("rejects a newPassword identical to the current password", () => {
		const result = changePasswordSchema.safeParse({
			currentPassword: "OldPass123!",
			newPassword: "OldPass123!",
			confirmPassword: "OldPass123!",
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].path).toEqual(["newPassword"]);
		}
	});
});

/**
 * Characterization tests — these pin the shared password policy in place so
 * the three schemas can't silently drift apart.
 */
describe("password strength policy", () => {
	const weak = [
		["shorter than 8 characters", "Ab1!xy"],
		["missing a lowercase letter", "PASSWORD1!"],
		["missing an uppercase letter", "password1!"],
		["missing a number", "Password!"],
		["missing a special character", "Password1"],
	] as const;

	describe.each([
		["registerSchema.password", (pw: string) => registerSchema.safeParse({ name: "Ada", email: "ada@example.com", password: pw })],
		["resetPasswordSchema.newPassword", (pw: string) => resetPasswordSchema.safeParse({ newPassword: pw, confirmPassword: pw })],
		["changePasswordSchema.newPassword", (pw: string) => changePasswordSchema.safeParse({ currentPassword: "OldPass123!", newPassword: pw, confirmPassword: pw })],
	])("%s", (_label, parse) => {
		it("accepts a strong password", () => {
			expect(parse("NewPass456!").success).toBe(true);
		});

		it.each(weak)("rejects one %s", (_reason, password) => {
			expect(parse(password).success).toBe(false);
		});
	});
});
