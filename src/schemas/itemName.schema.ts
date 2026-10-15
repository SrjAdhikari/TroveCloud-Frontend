//* src/schemas/itemName.schema.ts

import { z } from "zod/v4";

/** Name rules for a file or folder: 3–50 characters, like the server. */
const itemNameSchema = (label: string) =>
	z.object({
		name: z
			.string()
			.trim()
			.nonempty(`${label} name is required`)
			.min(3, `${label} name must be at least 3 characters`)
			.max(50, `${label} name must be at most 50 characters`),
	});

export const folderNameSchema = itemNameSchema("Folder");
export const fileNameSchema = itemNameSchema("File");

export type NameFormData = z.infer<typeof folderNameSchema>;
