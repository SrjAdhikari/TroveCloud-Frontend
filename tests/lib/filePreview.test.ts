//* tests/lib/filePreview.test.ts

import { describe, it, expect } from "vitest";

import { getPreviewType } from "@/lib/filePreview";

describe("getPreviewType", () => {
	it("maps the formats R2 is willing to serve inline", () => {
		expect(getPreviewType(".png")).toBe("image");
		expect(getPreviewType(".jpeg")).toBe("image");
		expect(getPreviewType(".gif")).toBe("image");
		expect(getPreviewType(".webp")).toBe("image");
		expect(getPreviewType(".avif")).toBe("image");
		expect(getPreviewType(".pdf")).toBe("pdf");
		expect(getPreviewType(".mp4")).toBe("video");
		expect(getPreviewType(".webm")).toBe("video");
		expect(getPreviewType(".mov")).toBe("video");
		expect(getPreviewType(".mp3")).toBe("audio");
		expect(getPreviewType(".wav")).toBe("audio");
		expect(getPreviewType(".ogg")).toBe("audio");
	});

	it("refuses formats the backend forces to attachment", () => {
		// Not on the inline allowlist, so a signed URL downloads instead of
		// rendering — claiming otherwise shows a preview pane that never fills.
		expect(getPreviewType(".svg")).toBe("unsupported");
		expect(getPreviewType(".avi")).toBe("unsupported");
		expect(getPreviewType(".mkv")).toBe("unsupported");
		expect(getPreviewType(".flac")).toBe("unsupported");
	});

	it("still treats text formats as previewable — they are fetched, not rendered natively", () => {
		expect(getPreviewType(".txt")).toBe("text");
		expect(getPreviewType(".csv")).toBe("text");
		expect(getPreviewType(".json")).toBe("text");
	});

	it("falls back to unsupported for anything unknown", () => {
		expect(getPreviewType(".exe")).toBe("unsupported");
		expect(getPreviewType("")).toBe("unsupported");
	});
});
