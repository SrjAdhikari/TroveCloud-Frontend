//* src/components/admin/OverviewLoadFailed.tsx

import LoadFailed from "@/components/admin/LoadFailed";
import type { ApiError } from "@/types/api.types";

interface OverviewLoadFailedProps {
	error: ApiError;
}

const ERROR_COPY = {
	INSUFFICIENT_ROLE: {
		title: "Access denied",
		description: "You don't have permissions to view this page.",
	},
};

const FALLBACK_COPY = {
	title: "Unable to load this page",
	description: "Check your connection and please try again later.",
};

const OverviewLoadFailed = ({ error }: OverviewLoadFailedProps) => (
	<LoadFailed error={error} errorCopy={ERROR_COPY} fallback={FALLBACK_COPY} />
);

export default OverviewLoadFailed;
