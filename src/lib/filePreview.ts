//* src/lib/filePreview.ts

import { API_BASE_URL } from "@/lib/constants";

type PreviewType = "image" | "pdf" | "video" | "audio" | "text" | "unsupported";

const PREVIEW_TYPE_MAP: Record<string, PreviewType> = {
	// Images
	png: "image",
	jpg: "image",
	jpeg: "image",
	gif: "image",
	svg: "image",
	webp: "image",

	// PDF
	pdf: "pdf",

	// Video
	mp4: "video",
	mov: "video",
	avi: "video",
	mkv: "video",
	webm: "video",

	// Audio
	mp3: "audio",
	wav: "audio",
	flac: "audio",
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
 * Returns the direct URL to preview/stream a file from the backend.
 * The backend serves raw binary, and the browser renders based on content type.
 */
const getFilePreviewUrl = (fileId: string) =>
	`${API_BASE_URL}/files/${fileId}`;

/**
 * Determines how a file should be previewed based on its extension.
 * Returns "unsupported" for file types the browser can't render inline.
 */
const getPreviewType = (extension: string): PreviewType => {
	const ext = extension.toLowerCase().replace(".", "");
	return PREVIEW_TYPE_MAP[ext] ?? "unsupported";
};

export type { PreviewType };

export { getFilePreviewUrl, getPreviewType };
