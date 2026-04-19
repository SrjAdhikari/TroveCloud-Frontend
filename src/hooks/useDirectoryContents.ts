//* src/hooks/useDirectoryContents.ts

import { useSearchParams, useNavigate } from "react-router";
import { useCurrentUser } from "@/hooks/useAuth";
import { useCurrentDirectory } from "@/hooks/useDirectory";

/**
 * Fetches the current directory contents, filters by search query,
 * and provides back navigation. Reads `dir` and `q` from URL search params.
 */
const useDirectoryContents = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	const dirId = searchParams.get("dir") || undefined;
	const searchQuery = searchParams.get("q")?.toLowerCase() || "";
	const rawQuery = searchParams.get("q") || "";

	const { data: userResponse } = useCurrentUser();
	const rootDirId = userResponse?.data?.rootDirId;

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

	/** Navigate to the parent directory. Goes to /my-files (no params) if parent is root. */
	const handleBack = () => {
		const parentId = directory?.parentDirId;
		if (!parentId || parentId === rootDirId) {
			navigate("/my-files");
		} else {
			navigate(`/my-files?dir=${parentId}`);
		}
	};

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
		handleBack,
	};
};

export default useDirectoryContents;
