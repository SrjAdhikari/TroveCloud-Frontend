//* src/schemas/directory.schema.ts

import { z } from "zod/v4";

/**
 * Validation schema for creating or renaming a folder.
 * Name must be 3–50 characters (matches backend constraint).
 */
const folderNameSchema = z.object({
	name: z
		.string()
		.trim()
		.nonempty("Folder name is required")
		.min(3, "Folder name must be at least 3 characters")
		.max(50, "Folder name must be at most 50 characters"),
});

type FolderNameFormData = z.infer<typeof folderNameSchema>;

export type { FolderNameFormData };

export { folderNameSchema };
