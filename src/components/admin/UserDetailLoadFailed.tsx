//* src/components/admin/UserDetailLoadFailed.tsx

import LoadFailed from "@/components/admin/LoadFailed";
import type { ApiError } from "@/types/api.types";

interface UserDetailLoadFailedProps {
	error: ApiError;
}

const ERROR_COPY = {
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

const FALLBACK_COPY = {
	title: "Unable to load this user",
	description: "Check your connection and please try again later.",
};

const UserDetailLoadFailed = ({ error }: UserDetailLoadFailedProps) => (
	<LoadFailed error={error} errorCopy={ERROR_COPY} fallback={FALLBACK_COPY} />
);

export default UserDetailLoadFailed;
