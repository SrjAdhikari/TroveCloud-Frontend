//* src/lib/filePreview.ts

type PreviewType = "image" | "pdf" | "video" | "audio" | "text" | "unsupported";

const PREVIEW_TYPE_MAP: Record<string, PreviewType> = {
	// Images
	png: "image",
	jpg: "image",
	jpeg: "image",
	gif: "image",
	webp: "image",
	avif: "image",

	// PDF
	pdf: "pdf",

	// Video
	mp4: "video",
	mov: "video",
	webm: "video",

	// Audio
	mp3: "audio",
	wav: "audio",
	ogg: "audio",

	// Code & text
	js: "text",
	ts: "text",
	jsx: "text",
	tsx: "text",
	html: "text",
	css: "text",
	json: "text",
	py: "text",
	txt: "text",
	md: "text",
	xml: "text",
	yml: "text",
	yaml: "text",
	csv: "text",
	env: "text",
	sh: "text",
	bat: "text",
	log: "text",
	rtf: "text",
};

/**
 * Determines how a file should be previewed based on its extension.
 * Returns "unsupported" for file types the browser can't render inline.
 */
const getPreviewType = (extension: string): PreviewType => {
	const ext = extension.toLowerCase().replace(".", "");
	return PREVIEW_TYPE_MAP[ext] ?? "unsupported";
};

export type { PreviewType };

export { getPreviewType };
