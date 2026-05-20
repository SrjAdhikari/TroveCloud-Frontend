//* src/components/admin/LoadFailed.tsx

import { ShieldX } from "lucide-react";

import EmptyStatePlaceholder from "@/components/ui/empty-state-placeholder";
import type { ApiError } from "@/types/api.types";

interface ErrorCopy {
	title: string;
	description: string;
}

interface LoadFailedProps {
	error: ApiError;
	errorCopy: Record<string, ErrorCopy>;
	fallback: ErrorCopy;
}

/**
 * Displays a user-friendly error message when loading admin page data fails.
 */
const LoadFailed = ({ error, errorCopy, fallback }: LoadFailedProps) => {
	const { title, description } = errorCopy[error.code] ?? fallback;

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

export default LoadFailed;
