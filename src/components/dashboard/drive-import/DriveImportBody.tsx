//* src/components/dashboard/drive-import/DriveImportBody.tsx

import { File as FileIcon, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import AlertBanner from "@/components/ui/alert-banner";
import DriveIcon from "@/components/icons/DriveIcon";

import { pluralize } from "@/lib/formatters";
import type { DriveImportFlow } from "@/hooks/useDriveImportFlow";
import type {
	DriveImportFailureReason,
	DriveImportResult,
} from "@/types/drive.types";

const FAILURE_REASON_LABELS: Record<DriveImportFailureReason, string> = {
	DRIVE_ITEM_NOT_FOUND:
		"We couldn't find this file — it may have been moved or deleted.",
	UNSUPPORTED_DRIVE_TYPE:
		"This file type isn't supported yet (Forms, Drawings, etc.).",
	DRIVE_EXPORT_TOO_LARGE:
		"Google Docs and Slides over 10 MB can't be imported.",
	DRIVE_IMPORT_LIMIT_EXCEEDED:
		"Files must be under 100 MB, and the total under 500 MB per import.",
	DRIVE_IMPORT_FAILED: "Something went wrong. Please try again.",
};

interface DriveImportBodyProps {
	status: DriveImportFlow["status"];
	error: string | null;
	result: DriveImportResult | null;
	pickedNames: Record<string, string>;
	onConnect: () => void;
}

/**
 * Renders the dialog body for each state of the import flow.
 */
const DriveImportBody = ({
	status,
	error,
	result,
	pickedNames,
	onConnect,
}: DriveImportBodyProps) => {
	if (status === "idle") return <IdleState onConnect={onConnect} />;

	if (status === "importing") {
		return <ImportingState pickedNames={pickedNames} />;
	}

	if (status === "done" && result) {
		return <ResultPanel result={result} pickedNames={pickedNames} />;
	}

	if (status === "error" && error) {
		return (
			<div className="p-5">
				<AlertBanner variant="error">{error}</AlertBanner>
			</div>
		);
	}

	return null;
};

const IdleState = ({ onConnect }: { onConnect: () => void }) => (
	<div className="flex flex-col items-center gap-5 px-5 py-10">
		<div className="rounded-full bg-primary/10 p-4">
			<DriveIcon className="size-8 text-primary" aria-hidden="true" />
		</div>

		<Button
			onClick={onConnect}
			className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
		>
			Connect Google Drive
		</Button>
	</div>
);

/**
 * Importing state — spinner + headline + dismissible hint, plus a bordered
 * list of picked items so the user has visibility into what's being processed
 */
const ImportingState = ({
	pickedNames,
}: {
	pickedNames: Record<string, string>;
}) => {
	const entries = Object.entries(pickedNames);
	const count = entries.length;

	return (
		<div className="flex flex-col items-center gap-3 px-5 py-8">
			<div
				className="flex flex-col items-center gap-3 text-center"
				role="status"
				aria-live="polite"
			>
				<Loader2
					className="size-6 animate-spin text-primary"
					aria-hidden="true"
				/>

				<p className="text-sm font-medium">
					Importing {pluralize(count, "item")} from Google Drive...
				</p>

				<p className="text-xs text-muted-foreground max-w-xs">
					You can close this window - we'll notify you once the import finishes
				</p>
			</div>

			{count > 0 && (
				<ul className="mt-2 w-full max-h-40 space-y-1 overflow-y-auto rounded-lg border p-2">
					{entries.map(([driveId, name]) => (
						<li
							key={driveId}
							className="flex items-center gap-2 rounded-md px-2 py-1.5"
						>
							<FileIcon
								className="size-4 shrink-0 text-muted-foreground"
								aria-hidden="true"
							/>
							<span className="truncate text-sm">{name}</span>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

const ResultPanel = ({
	result,
	pickedNames,
}: {
	result: DriveImportResult;
	pickedNames: Record<string, string>;
}) => {
	const importedCount = result.imported.length;
	const failedCount = result.failed.length;

	return (
		<div className="space-y-4 p-5" role="status">
			{importedCount > 0 && (
				<div>
					<p className="text-sm font-medium mb-2">
						{pluralize(importedCount, "file")} imported
					</p>

					<ul className="w-full max-h-40 space-y-1 overflow-y-auto rounded-lg border p-2">
						{result.imported.map((item) => (
							<li
								key={item.driveId}
								className="flex items-center gap-2 rounded-md px-2 py-1.5"
							>
								<FileIcon
									className="size-4 shrink-0 text-muted-foreground"
									aria-hidden="true"
								/>
								<span className="truncate text-sm">{item.name}</span>
							</li>
						))}
					</ul>
				</div>
			)}

			{failedCount > 0 && (
				<AlertBanner variant="error">
					<p className="font-medium">
						{pluralize(failedCount, "file")} couldn't be imported
					</p>

					<ul className="mt-2 space-y-2 text-xs max-h-40 overflow-y-auto">
						{result.failed.map((item) => (
							<li key={item.driveId}>
								<p className="truncate font-medium">
									{item.name ?? pickedNames[item.driveId] ?? "Unnamed item"}
								</p>

								<p>{FAILURE_REASON_LABELS[item.reason]}</p>
							</li>
						))}
					</ul>
				</AlertBanner>
			)}
		</div>
	);
};

export default DriveImportBody;
