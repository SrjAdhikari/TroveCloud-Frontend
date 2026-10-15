//* src/components/dashboard/drive-import/DriveImportFooter.tsx

import { Button } from "@/components/ui/button";
import type { DriveImportFlow } from "@/hooks/useDriveImportFlow";

interface DriveImportFooterProps {
	status: DriveImportFlow["status"];
	onClose: () => void;
	onRetry: () => void;
	onReset: () => void;
}

/** The dialog's buttons, which change with each step of the import. */
const DriveImportFooter = ({
	status,
	onClose,
	onRetry,
	onReset,
}: DriveImportFooterProps) => {
	if (status === "done") {
		return (
			<FooterRow>
				<Button
					variant="outline"
					onClick={() => {
						onReset();
						onClose();
					}}
					className="cursor-pointer"
				>
					Done
				</Button>
			</FooterRow>
		);
	}

	if (status === "error") {
		return (
			<FooterRow>
				<Button
					variant="outline"
					onClick={onClose}
					className="cursor-pointer"
				>
					Cancel
				</Button>

				<Button onClick={onRetry} className="cursor-pointer">
					Try again
				</Button>
			</FooterRow>
		);
	}

	// Before and during the import there's one button: Cancel or Close.
	const label = status === "importing" ? "Close" : "Cancel";

	return (
		<FooterRow>
			<Button
				variant="outline"
				onClick={onClose}
				className="cursor-pointer"
			>
				{label}
			</Button>
		</FooterRow>
	);
};

const FooterRow = ({ children }: { children: React.ReactNode }) => (
	<div className="flex justify-end gap-2 p-5">{children}</div>
);

export default DriveImportFooter;
