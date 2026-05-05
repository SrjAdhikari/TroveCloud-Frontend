//* src/lib/fileSize.ts

import { MAX_FILE_SIZE_BYTES } from "@/lib/constants";

/** Splits files into ones that fit the per-file cap and ones that exceed it. */
const splitFilesBySize = (files: File[]) => {
	const allowed: File[] = [];
	const oversized: File[] = [];

	files.forEach((file) => {
		if (file.size > MAX_FILE_SIZE_BYTES) oversized.push(file);
		else allowed.push(file);
	});

	return { allowed, oversized };
};

export default splitFilesBySize;
