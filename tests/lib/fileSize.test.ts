//* tests/lib/fileSize.test.ts

import { describe, it, expect } from "vitest";
import splitFilesBySize from "@/lib/fileSize";
import { MAX_FILE_SIZE_BYTES } from "@/lib/constants";

/**
 * Stubs `size` instead of allocating real bytes — the cap is 100 MB and
 * splitFilesBySize only ever reads file.size.
 */
const makeFile = (name: string, size: number) => {
	const file = new File([], name);
	Object.defineProperty(file, "size", { value: size });
	return file;
};

describe("splitFilesBySize", () => {
	it("puts a file under the cap into allowed", () => {
		const file = makeFile("small.txt", MAX_FILE_SIZE_BYTES - 1);
		expect(splitFilesBySize([file])).toEqual({
			allowed: [file],
			oversized: [],
		});
	});

	it("puts a file over the cap into oversized", () => {
		const file = makeFile("huge.zip", MAX_FILE_SIZE_BYTES + 1);
		expect(splitFilesBySize([file])).toEqual({
			allowed: [],
			oversized: [file],
		});
	});

	it("allows a file exactly at the cap", () => {
		const file = makeFile("exact.bin", MAX_FILE_SIZE_BYTES);
		expect(splitFilesBySize([file])).toEqual({
			allowed: [file],
			oversized: [],
		});
	});

	it("splits a mixed batch into the correct buckets, preserving order", () => {
		const ok = makeFile("ok.txt", 10);
		const big = makeFile("big.mp4", MAX_FILE_SIZE_BYTES + 1);
		const atCap = makeFile("at-cap.bin", MAX_FILE_SIZE_BYTES);

		expect(splitFilesBySize([ok, big, atCap])).toEqual({
			allowed: [ok, atCap],
			oversized: [big],
		});
	});

	it("returns empty buckets for an empty list", () => {
		expect(splitFilesBySize([])).toEqual({ allowed: [], oversized: [] });
	});

	it("allows a zero-byte file", () => {
		const file = makeFile("empty.txt", 0);
		expect(splitFilesBySize([file])).toEqual({
			allowed: [file],
			oversized: [],
		});
	});

	it("puts every file into oversized when all exceed the cap", () => {
		const files = [
			makeFile("a.zip", MAX_FILE_SIZE_BYTES + 1),
			makeFile("b.zip", MAX_FILE_SIZE_BYTES * 2),
			makeFile("c.zip", MAX_FILE_SIZE_BYTES + 1000),
		];
		expect(splitFilesBySize(files)).toEqual({ allowed: [], oversized: files });
	});

	it("preserves each file's relative order within its own bucket", () => {
		const a = makeFile("a-small", 1);
		const b = makeFile("b-big", MAX_FILE_SIZE_BYTES + 1);
		const c = makeFile("c-small", 2);
		const d = makeFile("d-big", MAX_FILE_SIZE_BYTES + 1);
		const e = makeFile("e-small", 3);

		const { allowed, oversized } = splitFilesBySize([a, b, c, d, e]);
		expect(allowed).toEqual([a, c, e]);
		expect(oversized).toEqual([b, d]);
	});

	it("does not mutate the input array", () => {
		const input = [
			makeFile("ok.txt", 10),
			makeFile("big.mp4", MAX_FILE_SIZE_BYTES + 1),
		];
		const snapshot = [...input];

		splitFilesBySize(input);

		expect(input).toEqual(snapshot);
	});

	it("keeps duplicate entries — deduping is the caller's job", () => {
		const file = makeFile("dup.txt", 10);
		expect(splitFilesBySize([file, file])).toEqual({
			allowed: [file, file],
			oversized: [],
		});
	});

	it("partitions a large alternating batch and holds the size invariant", () => {
		const files = Array.from({ length: 1000 }, (_, index) =>
			makeFile(
				`f-${index}`,
				index % 2 === 0 ? MAX_FILE_SIZE_BYTES : MAX_FILE_SIZE_BYTES + 1,
			),
		);

		const { allowed, oversized } = splitFilesBySize(files);

		expect(allowed).toHaveLength(500);
		expect(oversized).toHaveLength(500);
		expect(allowed.every((file) => file.size <= MAX_FILE_SIZE_BYTES)).toBe(true);
		expect(oversized.every((file) => file.size > MAX_FILE_SIZE_BYTES)).toBe(true);
	});
});
