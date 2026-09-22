//* tests/lib/storage.test.ts

import { describe, it, expect } from "vitest";
import { FileText, File } from "lucide-react";
import {
	getUsagePercent,
	getUsageBarColor,
	buildBreakdown,
	STORAGE_CATEGORY_META,
	checkUploadQuota,
} from "@/lib/storage";
import type { StorageCategory, StorageUsage } from "@/types/storage.types";

describe("getUsagePercent", () => {
	it("rounds used/total to a whole percent", () => {
		expect(getUsagePercent(575_703_552, 1_000_000_000)).toBe(58);
	});

	it("returns 0 when total is zero or invalid", () => {
		expect(getUsagePercent(500, 0)).toBe(0);
	});

	it("clamps above 100", () => {
		expect(getUsagePercent(2_000_000_000, 1_000_000_000)).toBe(100);
	});
});

describe("getUsageBarColor", () => {
	it("uses the brand primary token below 75%", () => {
		expect(getUsageBarColor(0)).toBe("bg-primary");
		expect(getUsageBarColor(74)).toBe("bg-primary");
	});

	it("switches to the warning token from 75% up to 90%", () => {
		expect(getUsageBarColor(75)).toBe("bg-warning");
		expect(getUsageBarColor(89)).toBe("bg-warning");
	});

	it("switches to the danger token at 90% and above", () => {
		expect(getUsageBarColor(90)).toBe("bg-danger");
		expect(getUsageBarColor(100)).toBe("bg-danger");
	});
});

describe("buildBreakdown", () => {
	const usage: StorageUsage = {
		used: 1_000_000_000,
		total: 2_000_000_000,
		breakdown: [
			{ category: "Documents", size: 500_000_000, icon: "file-text" },
			{ category: "Images", size: 250_000_000, icon: "image" },
		],
	};

	it("maps each category to a formatted size and a width relative to used", () => {
		const rows = buildBreakdown(usage);
		expect(rows[0]).toMatchObject({
			label: "Documents",
			size: "500 MB",
			widthPercent: 50,
			barColor: "bg-chart-4",
		});
		expect(rows[0].icon).toBe(FileText);
	});

	it("falls back to the neutral Other entry for an unknown category", () => {
		const rows = buildBreakdown({
			...usage,
			breakdown: [
				{ category: "Mystery" as unknown as StorageCategory, size: 100, icon: "x" },
			],
		});
		expect(rows[0].icon).toBe(File);
		expect(rows[0].barColor).toBe("bg-muted-foreground");
	});

	it("clamps a category wider than used to 100%", () => {
		const rows = buildBreakdown({
			used: 100,
			total: 1_000,
			breakdown: [{ category: "Documents", size: 250, icon: "file-text" }],
		});
		expect(rows[0].widthPercent).toBe(100);
	});

	it("returns an empty array when there are no files", () => {
		expect(
			buildBreakdown({ used: 0, total: 2_000_000_000, breakdown: [] }),
		).toEqual([]);
	});
});

describe("STORAGE_CATEGORY_META", () => {
	it("assigns a distinct bar token to each of the five colored categories", () => {
		const tokens = [
			STORAGE_CATEGORY_META.Documents.barColor,
			STORAGE_CATEGORY_META.Images.barColor,
			STORAGE_CATEGORY_META.Videos.barColor,
			STORAGE_CATEGORY_META.Audio.barColor,
			STORAGE_CATEGORY_META.Archives.barColor,
		];
		expect(new Set(tokens).size).toBe(5);
	});
});

describe("checkUploadQuota", () => {
	const usage = (used: number, total: number): StorageUsage => ({
		used,
		total,
		breakdown: [],
	});

	it("allows a selection that fits inside the remaining quota", () => {
		expect(checkUploadQuota(100, usage(400, 1000))).toEqual({
			blocked: false,
			remaining: 600,
		});
	});

	it("allows a selection that exactly fills the quota", () => {
		expect(checkUploadQuota(600, usage(400, 1000))).toEqual({
			blocked: false,
			remaining: 600,
		});
	});

	it("blocks a selection one byte over the remaining quota", () => {
		expect(checkUploadQuota(601, usage(400, 1000))).toEqual({
			blocked: true,
			remaining: 600,
		});
	});

	it("clamps remaining to zero when used exceeds total", () => {
		expect(checkUploadQuota(1, usage(1200, 1000))).toEqual({
			blocked: true,
			remaining: 0,
		});
	});

	it("allows a zero-byte selection with no quota left", () => {
		expect(checkUploadQuota(0, usage(1000, 1000))).toEqual({
			blocked: false,
			remaining: 0,
		});
	});

	it("fails open when usage has not loaded", () => {
		expect(checkUploadQuota(999_999, undefined).blocked).toBe(false);
	});

	it("fails open when the payload carries non-finite numbers", () => {
		expect(checkUploadQuota(999, usage(Number.NaN, 1000)).blocked).toBe(false);
		expect(checkUploadQuota(999, usage(0, Number.POSITIVE_INFINITY)).blocked).toBe(
			false,
		);
	});
});
