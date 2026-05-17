//* src/components/admin/OverviewLoadFailed.tsx

import { ShieldX } from "lucide-react";

import EmptyStatePlaceholder from "@/components/ui/empty-state-placeholder";
import type { ApiError } from "@/types/api.types";

interface OverviewLoadFailedProps {
	error: ApiError;
}

interface ErrorCopy {
	title: string;
	description: string;
}

/**
 * Maps backend error codes to user-facing copy.
 * Static strings only — never use the backend's `error.message`.
 */
const ERROR_COPY: Record<string, ErrorCopy> = {
	INSUFFICIENT_ROLE: {
		title: "Access denied",
		description: "You don't have permissions to view this page.",
	},
};

const FALLBACK_COPY: ErrorCopy = {
	title: "Unable to load the this page",
	description: "Check your connection and please try again later.",
};

/**
 * Placeholder shown when the admin overview query fails — maps known error
 * codes to friendly copy, falling back to generic connection-failure text.
 */
const OverviewLoadFailed = ({ error }: OverviewLoadFailedProps) => {
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

export default OverviewLoadFailed;
