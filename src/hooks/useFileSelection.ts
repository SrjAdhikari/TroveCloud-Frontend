//* src/hooks/useFileSelection.ts

import { useState, useCallback } from "react";

/** Keeps track of the files picked for upload. */
const useFileSelection = () => {
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

	/** Skips files already in the list (same name and size). */
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

	const removeFile = (index: number) => {
		setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
	};

	const reset = () => setSelectedFiles([]);

	const totalSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);

	return { selectedFiles, addFiles, removeFile, reset, totalSize };
};

export default useFileSelection;
