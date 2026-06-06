//* src/schemas/profile.schema.ts

import { z } from "zod/v4";

/**
 * Validation schema for the profile name form. Mirrors the register form's
 * name rule (trim, 3–50) so a user can't set a weaker name here than at signup.
 */
const profileNameSchema = z.object({
	name: z
		.string()
		.trim()
		.nonempty("Name is required")
		.min(3, "Name must be at least 3 characters")
		.max(50, "Name must be at most 50 characters"),
});

type ProfileNameFormData = z.infer<typeof profileNameSchema>;

export type { ProfileNameFormData };
export { profileNameSchema };
