//* src/components/admin/ConfirmActionDialog.tsx

import { useState, type ReactNode } from "react";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AlertBanner from "@/components/ui/alert-banner";
import type { ApiError } from "@/types/api.types";

const GENERIC_ERROR_COPY = "Something went wrong. Please try again.";

interface ConfirmActionDialogProps {
	onClose: () => void;
	title: string;
	description: string;
	confirmLabel: string;
	variant?: "default" | "destructive";
	onConfirm: () => Promise<void>;
	errorCopy: Record<string, string>;
	confirmDisabled?: boolean;
	children?: ReactNode;
}

/**
 * Confirmation dialog for admin mutations. Async confirm with inline
 * AlertBanner on rejection, errorCopy[code] → generic fallback (never
 * error.message). Auto-closes via onClose on success or dialog dismiss.
 */
const ConfirmActionDialog = ({
	onClose,
	title,
	description,
	confirmLabel,
	variant = "default",
	onConfirm,
	errorCopy,
	confirmDisabled = false,
	children,
}: ConfirmActionDialogProps) => {
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isPending, setIsPending] = useState(false);

	const handleConfirm = async () => {
		setErrorMessage(null);
		setIsPending(true);
		try {
			await onConfirm();
			onClose();
		} catch (error) {
			const code = (error as ApiError | undefined)?.code;
			setErrorMessage((code && errorCopy[code]) || GENERIC_ERROR_COPY);
		} finally {
			setIsPending(false);
		}
	};

	return (
		<Dialog open onOpenChange={(next) => !next && onClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>

				{children}

				{errorMessage && (
					<AlertBanner variant="error">{errorMessage}</AlertBanner>
				)}

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={onClose}
						disabled={isPending}
					>
						Cancel
					</Button>
					<Button
						type="button"
						variant={variant}
						onClick={handleConfirm}
						disabled={isPending || confirmDisabled}
					>
						{isPending ? "Working..." : confirmLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ConfirmActionDialog;
