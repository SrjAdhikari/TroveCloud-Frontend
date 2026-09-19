//* src/components/dashboard/drive-import/DriveImportFooter.tsx

import { Button } from "@/components/ui/button";
import type { DriveImportFlow } from "@/hooks/useDriveImportFlow";

interface DriveImportFooterProps {
	status: DriveImportFlow["status"];
	onClose: () => void;
	onRetry: () => void;
	onReset: () => void;
}

/** Footer buttons whose layout depends on the current flow state. */
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

	// idle / picking / importing — single Cancel/Close action.
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
