//* src/hooks/useDirectoryContents.ts

import { useSearchParams } from "react-router";
import { useCurrentDirectory } from "@/hooks/useDirectory";

/** Gets the folder (`dir`) and search text (`q`) from the URL. */
const useDirectoryContents = () => {
	const [searchParams] = useSearchParams();

	const dirId = searchParams.get("dir") || undefined;
	const searchQuery = searchParams.get("q")?.toLowerCase() || "";
	const rawQuery = searchParams.get("q") || "";

	const { data, isLoading, error } = useCurrentDirectory(dirId);
	const directory = data?.data;

	const isRoot = !directory?.parentDirId;

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
		error,
		isRoot,
		folders,
		files,
		isEmpty,
		searchQuery,
		rawQuery,
	};
};

export default useDirectoryContents;
