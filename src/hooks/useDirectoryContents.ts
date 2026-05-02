//* src/hooks/useDirectoryContents.ts

import { useSearchParams } from "react-router";
import { useCurrentDirectory } from "@/hooks/useDirectory";

/**
 * Fetches the current directory contents and filters by search query.
 * Reads `dir` and `q` from URL search params.
 */
const useDirectoryContents = () => {
	const [searchParams] = useSearchParams();

	const dirId = searchParams.get("dir") || undefined;
	const searchQuery = searchParams.get("q")?.toLowerCase() || "";
	const rawQuery = searchParams.get("q") || "";

	const { data, isLoading } = useCurrentDirectory(dirId);
	const directory = data?.data;

	const isRoot = !directory?.parentDirId;

	/** Filter folders and files by name when a search query is active */
	const folders = (directory?.childDirectories ?? []).filter((f) =>
		f.name.toLowerCase().includes(searchQuery),
	);

	const files = (directory?.files ?? []).filter((f) =>
		f.name.toLowerCase().includes(searchQuery),
	);

	const isEmpty = folders.length === 0 && files.length === 0;

	return {
		dirId,
		directory,
		isLoading,
		isRoot,
		folders,
		files,
		isEmpty,
		searchQuery,
		rawQuery,
	};
};

export default useDirectoryContents;
