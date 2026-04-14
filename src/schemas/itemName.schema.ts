//* src/schemas/itemName.schema.ts

import { z } from "zod/v4";

/**
 * Creates a validation schema for a name input (file or folder).
 * Name must be 3–50 characters (matches backend constraint).
 */
const itemNameSchema = (label: string) =>
	z.object({
		name: z
			.string()
			.trim()
			.nonempty(`${label} name is required`)
			.min(3, `${label} name must be at least 3 characters`)
			.max(50, `${label} name must be at most 50 characters`),
	});

const folderNameSchema = itemNameSchema("Folder");
const fileNameSchema = itemNameSchema("File");

type NameFormData = z.infer<typeof folderNameSchema>;

export type { NameFormData };

export { folderNameSchema, fileNameSchema };
