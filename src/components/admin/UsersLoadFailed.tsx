//* src/components/admin/UsersLoadFailed.tsx

import { ShieldX } from "lucide-react";

import EmptyStatePlaceholder from "@/components/ui/empty-state-placeholder";
import type { ApiError } from "@/types/api.types";

interface UsersLoadFailedProps {
	error: ApiError;
}

interface ErrorCopy {
	title: string;
	description: string;
}

const ERROR_COPY: Record<string, ErrorCopy> = {
	INSUFFICIENT_ROLE: {
		title: "Access denied",
		description: "You don't have permissions to view this page.",
	},
};

const FALLBACK_COPY: ErrorCopy = {
	title: "Unable to load users",
	description: "Check your connection and please try again later.",
};

/**
 * Placeholder shown when the users list query fails — maps known error codes
 * to friendly copy, falling back to generic connection-failure text.
 */
const UsersLoadFailed = ({ error }: UsersLoadFailedProps) => {
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

export default UsersLoadFailed;
