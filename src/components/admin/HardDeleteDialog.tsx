//* src/components/admin/HardDeleteDialog.tsx

import { useState } from "react";

import ConfirmActionDialog from "@/components/admin/ConfirmActionDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ACTION_META } from "@/lib/adminAction";
import ADMIN_ACTION_TEXT from "@/lib/adminActionText";

interface HardDeleteDialogProps {
	onClose: () => void;
	userEmail: string;
	userName: string;
	onConfirm: () => Promise<void>;
}

const TEXT = ADMIN_ACTION_TEXT.hardDelete;

/**
 * Type-to-confirm wrapper around ConfirmActionDialog for permanent user
 * deletion. Confirm button stays disabled until the typed value matches
 * the target email (case-insensitive, whitespace-trimmed).
 */
const HardDeleteDialog = ({
	onClose,
	userEmail,
	userName,
	onConfirm,
}: HardDeleteDialogProps) => {
	const [typed, setTyped] = useState("");

	const isMatch =
		typed.trim().toLowerCase() === userEmail.trim().toLowerCase();

	return (
		<ConfirmActionDialog
			onClose={onClose}
			icon={ACTION_META.hardDelete.icon}
			title={TEXT.title}
			description={TEXT.description(userName)}
			confirmLabel={TEXT.confirmLabel}
			variant={TEXT.variant}
			onConfirm={onConfirm}
			errorCopy={TEXT.errorCopy}
			confirmDisabled={!isMatch}
		>
			<div className="space-y-2">
				<Label htmlFor="hard-delete-confirm" className="text-sm text-destructive">
					Type the user&apos;s email to confirm
				</Label>

				<Input
					id="hard-delete-confirm"
					type="email"
					autoComplete="off"
					placeholder="name@example.com"
					value={typed}
					onChange={(event) => setTyped(event.target.value)}
				/>
			</div>
		</ConfirmActionDialog>
	);
};

export default HardDeleteDialog;
