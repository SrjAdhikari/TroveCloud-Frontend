//* tests/lib/validateImageFile.test.ts

import { describe, it, expect } from "vitest";
import validateImageFile from "@/lib/validateImageFile";
import { MAX_PROFILE_PICTURE_BYTES } from "@/lib/constants";

const makeFile = (type: string, size: number) =>
	new File([new Uint8Array(size)], "pic", { type });

describe("validateImageFile", () => {
	it("accepts a JPEG under the size cap", () => {
		expect(validateImageFile(makeFile("image/jpeg", 10)).ok).toBe(true);
	});

	it("accepts PNG and WEBP", () => {
		expect(validateImageFile(makeFile("image/png", 10)).ok).toBe(true);
		expect(validateImageFile(makeFile("image/webp", 10)).ok).toBe(true);
	});

	it("rejects a GIF with INVALID_IMAGE_TYPE", () => {
		const result = validateImageFile(makeFile("image/gif", 10));
		expect(result).toEqual({ ok: false, code: "INVALID_IMAGE_TYPE" });
	});

	it("rejects an SVG with INVALID_IMAGE_TYPE", () => {
		const result = validateImageFile(makeFile("image/svg+xml", 10));
		expect(result).toEqual({ ok: false, code: "INVALID_IMAGE_TYPE" });
	});

	it("rejects a file over the size cap with IMAGE_TOO_LARGE", () => {
		const result = validateImageFile(
			makeFile("image/png", MAX_PROFILE_PICTURE_BYTES + 1),
		);
		expect(result).toEqual({ ok: false, code: "IMAGE_TOO_LARGE" });
	});

	it("accepts a file exactly at the size cap", () => {
		expect(
			validateImageFile(makeFile("image/png", MAX_PROFILE_PICTURE_BYTES)).ok,
		).toBe(true);
	});

	it("checks type before size", () => {
		const result = validateImageFile(
			makeFile("image/gif", MAX_PROFILE_PICTURE_BYTES + 1),
		);
		expect(result).toEqual({ ok: false, code: "INVALID_IMAGE_TYPE" });
	});
});
