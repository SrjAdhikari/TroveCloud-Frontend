//* src/components/admin/UserDetailLoadFailed.tsx

import { ShieldX } from "lucide-react";

import EmptyStatePlaceholder from "@/components/ui/empty-state-placeholder";
import type { ApiError } from "@/types/api.types";

interface UserDetailLoadFailedProps {
	error: ApiError;
}

interface ErrorCopy {
	title: string;
	description: string;
}

const ERROR_COPY: Record<string, ErrorCopy> = {
	INVALID_ID: {
		title: "That user link looks broken",
		description: "Double-check the URL or head back to the users list.",
	},
	USER_NOT_FOUND: {
		title: "This user no longer exists",
		description:
			"They may have been removed. Head back to the users list to see who's still here.",
	},
	INSUFFICIENT_ROLE: {
		title: "Access denied",
		description: "You don't have permissions to view this page.",
	},
};

const FALLBACK_COPY: ErrorCopy = {
	title: "Unable to load this user",
	description: "Check your connection and please try again later.",
};

/**
 * Placeholder shown when the user-detail query fails. Maps known 
 * error codes to friendly copy, falling back to a generic message.
 */
const UserDetailLoadFailed = ({ error }: UserDetailLoadFailedProps) => {
	const { title, description } = ERROR_COPY[error.code] ?? FALLBACK_COPY;

	return (
		<div role="alert">
			<EmptyStatePlaceholder
				icon={ShieldX}
				title={title}
				description={description}
			/>
		</div>
	);
};

export default UserDetailLoadFailed;
