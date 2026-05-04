//* src/components/dashboard/directory/DirectoryLoadFailed.tsx

import { ArrowLeft, FolderX } from "lucide-react";
import { Link } from "react-router";

import ROUTES from "@/routes/paths";
import { Button } from "@/components/ui/button";
import DirectoryPlaceholder from "@/components/dashboard/directory/DirectoryPlaceholder";
import type { ApiError } from "@/types/api.types";

interface DirectoryLoadFailedProps {
	error: ApiError;
}

interface ErrorCopy {
	title: string;
	description: string;
}

/**
 * Maps backend error codes to user-facing copy. 
 * Static strings only - never use the backend's `error.message`.
 */
const ERROR_COPY: Record<string, ErrorCopy> = {
	DIRECTORY_NOT_FOUND: {
		title: "Folder not found",
		description: "The folder you're looking for doesn't exist or was deleted.",
	},
	INVALID_ID: {
		title: "Invalid folder link",
		description: "The folder link you're trying to access isn't valid.",
	},
	ACCESS_DENIED: {
		title: "Can't access this folder",
		description: "You don't have permission to view this folder.",
	},
};

const FALLBACK_COPY: ErrorCopy = {
	title: "Couldn't load this folder",
	description: "Check your connection and please try again.",
};

/**
 * Placeholder shown when the directory query fails — maps known error codes
 * to friendly copy and offers a recovery link to the user's root directory.
 */
const DirectoryLoadFailed = ({ error }: DirectoryLoadFailedProps) => {
	const { title, description } = ERROR_COPY[error.code] ?? FALLBACK_COPY;

	return (
		<div role="alert">
			<DirectoryPlaceholder
				icon={FolderX}
				title={title}
				description={description}
			>
				<Button asChild variant="outline" className="cursor-pointer">
					<Link to={ROUTES.MY_FILES}>
						<ArrowLeft aria-hidden="true" className="size-4" />
						Back to My Files
					</Link>
				</Button>
			</DirectoryPlaceholder>
		</div>
	);
};

export default DirectoryLoadFailed;
