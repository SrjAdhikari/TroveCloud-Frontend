//* src/components/admin/ConfirmActionDialog.tsx

import { useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

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
import cn from "@/lib/utils";
import type { ApiError } from "@/types/api.types";

const GENERIC_ERROR_COPY = "Something went wrong. Please try again.";

interface ConfirmActionDialogProps {
	onClose: () => void;
	icon: LucideIcon;
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
	icon: Icon,
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
		<Dialog
			open
			onOpenChange={(next) => !next && !isPending && onClose()}
		>
			<DialogContent className="min-w-xs max-w-xs sm:max-w-xs p-5 gap-4 max-sm:min-w-[calc(100%-2rem)] bg-background">
				<DialogHeader className="text-center gap-1">
					<div
						className={cn(
							"mx-auto mb-1 flex size-10 items-center justify-center rounded-lg",
							variant === "destructive" ? "bg-destructive/10" : "bg-primary/10",
						)}
					>
						<Icon
							aria-hidden="true"
							className={cn(
								"size-5",
								variant === "destructive" ? "text-destructive" : "text-primary",
							)}
						/>
					</div>

					<DialogTitle className="font-heading text-base font-medium">
						{title}
					</DialogTitle>
					<DialogDescription className="text-xs">
						{description}
					</DialogDescription>
				</DialogHeader>

				{children}

				{errorMessage && (
					<AlertBanner variant="error">{errorMessage}</AlertBanner>
				)}

				<DialogFooter className="grid grid-cols-2 sm:grid sm:grid-cols-2 sm:justify-stretch">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={onClose}
						disabled={isPending}
						className="cursor-pointer"
					>
						Cancel
					</Button>

					<Button
						type="button"
						variant={variant}
						size="sm"
						onClick={handleConfirm}
						disabled={isPending || confirmDisabled}
						className="cursor-pointer"
					>
						{isPending ? "Processing..." : confirmLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ConfirmActionDialog;
