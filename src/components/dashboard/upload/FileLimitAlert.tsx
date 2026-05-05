//* src/components/dashboard/upload/FileLimitAlert.tsx

import { MAX_FILE_SIZE_LABEL } from "@/lib/constants";
import AlertBanner from "@/components/ui/alert-banner";

interface FileLimitAlertProps {
	names: string[];
}

/**
 * Inline rejection notice for files that exceed the per-file size cap.
 * Renders nothing when no oversized files are queued, so the parent
 * doesn't need its own conditional guard.
 */
const FileLimitAlert = ({ names }: FileLimitAlertProps) => {
	if (names.length === 0) return null;

	return (
		<AlertBanner variant="error">
			{names.length === 1 ? (
				<p>
					<span className="font-medium">{names[0]}</span> exceeds the{" "}
					{MAX_FILE_SIZE_LABEL} size limit.
				</p>
			) : (
				<>
					<p className="font-medium">
						{names.length} files exceed the {MAX_FILE_SIZE_LABEL} size limit:
					</p>

					<ul className="mt-1 space-y-0.5 text-xs">
						{names.map((name, index) => (
							<li key={`${name}-${index}`} className="truncate">
								{name}
							</li>
						))}
					</ul>
				</>
			)}
		</AlertBanner>
	);
};

export default FileLimitAlert;
