//* src/components/dashboard/dialogs/DriveImportDialog.tsx

import { useEffect } from "react";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import DriveImportBody from "@/components/dashboard/drive-import/DriveImportBody";
import DriveImportFooter from "@/components/dashboard/drive-import/DriveImportFooter";
import type { DriveImportFlow } from "@/hooks/useDriveImportFlow";

interface DriveImportDialogProps {
	flow: DriveImportFlow;
	onClose: () => void;
}

/**
 * Drive Import dialog shell
 * - Parent-conditionally mounted: internal state resets naturally on every open.
 * - The flow lives in the parent so closing mid-import doesn't cancel the in-flight request.
 */
const DriveImportDialog = ({ flow, onClose }: DriveImportDialogProps) => {
	const { status, error, result, pickedNames, start, reset, setBackground } =
		flow;

	// Clear stale background flag, and reset any leftover done or error state 
	// from a previous run so the dialog opens fresh
	useEffect(() => {
		setBackground(false);
		if (status === "done" || status === "error") reset();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Auto-close on full success — the directory listing already refreshed via
	// query invalidation, and a completion toast fired from the hook
	// The result panel only earns its place when there's something failed to show
	useEffect(() => {
		if (status === "done" && result && result.failed.length === 0) {
			reset();
			onClose();
		}
	}, [status, result, reset, onClose]);

	const handleOpenChange = (open: boolean) => {
		if (open) return;

		// Closing mid-import → finish in background, fire toast on completion.
		// Otherwise reset so the next open starts fresh.
		if (status === "importing") setBackground(true);
		else reset();
		onClose();
	};

	return (
		<Dialog open onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-lg bg-background gap-0 p-0 top-[50%] max-h-[90vh] flex flex-col">
				<DialogHeader className="p-5">
					<DialogTitle>Import from Google Drive</DialogTitle>
					<DialogDescription>
						Bring files and folders from your Google Drive into TroveCloud.
					</DialogDescription>
				</DialogHeader>

				<Separator />

				<div className="flex-1 overflow-y-auto">
					<DriveImportBody
						status={status}
						error={error}
						result={result}
						pickedNames={pickedNames}
						onConnect={start}
					/>
				</div>

				<Separator />

				<DriveImportFooter
					status={status}
					onClose={() => handleOpenChange(false)}
					onRetry={start}
					onReset={reset}
				/>
			</DialogContent>
		</Dialog>
	);
};

export default DriveImportDialog;
