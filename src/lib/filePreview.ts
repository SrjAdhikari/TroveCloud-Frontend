//* src/lib/filePreview.ts

export type PreviewType =
	| "image"
	| "pdf"
	| "video"
	| "audio"
	| "text"
	| "unsupported";

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
 * Picks how to preview a file from its extension.
 * Returns "unsupported" when the browser can't show it.
 */
export const getPreviewType = (extension: string): PreviewType => {
	const ext = extension.toLowerCase().replace(".", "");
	return PREVIEW_TYPE_MAP[ext] ?? "unsupported";
};
