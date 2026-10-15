//* src/schemas/profile.schema.ts

import { z } from "zod/v4";

/** Same name rules as sign-up: trimmed, 3–50 characters. */
export const profileNameSchema = z.object({
	name: z
		.string()
		.trim()
		.nonempty("Name is required")
		.min(3, "Name must be at least 3 characters")
		.max(50, "Name must be at most 50 characters"),
});

export type ProfileNameFormData = z.infer<typeof profileNameSchema>;
