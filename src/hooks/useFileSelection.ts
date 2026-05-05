//* src/hooks/useFileSelection.ts

import { useState, useCallback } from "react";

/**
 * Manages a list of selected files with add, remove, reset, and
 * duplicate-prevention logic. Used by the FileUploadDialog.
 */
const useFileSelection = () => {
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

	/** Adds files to the list, skipping duplicates matched by name+size */
	const addFiles = useCallback((files: FileList | File[]) => {
		const newFiles = Array.from(files);

		setSelectedFiles((prev) => {
			const existing = new Set(prev.map((f) => `${f.name}-${f.size}`));
			const unique = newFiles.filter(
				(f) => !existing.has(`${f.name}-${f.size}`),
			);

			return [...prev, ...unique];
		});
	}, []);

	/** Removes a file from the list by index */
	const removeFile = (index: number) => {
		setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
	};

	/** Clears the entire selection */
	const reset = () => setSelectedFiles([]);

	/** Total size of all selected files in bytes */
	const totalSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);

	return { selectedFiles, addFiles, removeFile, reset, totalSize };
};

export default useFileSelection;
