//* src/lib/validateImageFile.ts

import {
	ACCEPTED_IMAGE_TYPES,
	MAX_PROFILE_PICTURE_BYTES,
} from "@/lib/constants";

type ImageValidationResult =
	| { ok: true }
	| { ok: false; code: "INVALID_IMAGE_TYPE" | "IMAGE_TOO_LARGE" };

/**
 * Client-side guard mirroring the backend's profile-picture rules for image files.
 * Type is checked before size so a wrong-format file reports the type error first.
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

export type { ImageValidationResult };
export default validateImageFile;
