//* src/lib/validateImageFile.ts

import {
	ACCEPTED_IMAGE_TYPES,
	MAX_PROFILE_PICTURE_BYTES,
} from "@/lib/constants";

export type ImageValidationResult =
	| { ok: true }
	| { ok: false; code: "INVALID_IMAGE_TYPE" | "IMAGE_TOO_LARGE" };

/**
 * Checks a profile picture against the same rules the server uses. Checks the
 * type before the size, so a wrong file type is reported first.
 */
const validateImageFile = (file: File): ImageValidationResult => {
	if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
		return { ok: false, code: "INVALID_IMAGE_TYPE" };
	}

	if (file.size > MAX_PROFILE_PICTURE_BYTES) {
		return { ok: false, code: "IMAGE_TOO_LARGE" };
	}

	return { ok: true };
};

export default validateImageFile;
