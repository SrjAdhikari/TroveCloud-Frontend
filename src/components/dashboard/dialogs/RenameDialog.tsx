//* src/components/dashboard/dialogs/RenameDialog.tsx

import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

import { useRenameDirectory } from "@/hooks/useDirectory";
import { useRenameFile } from "@/hooks/useFile";
import { folderNameSchema, fileNameSchema } from "@/schemas/itemName.schema";
import NameDialog from "@/components/dashboard/dialogs/NameDialog";
import type { NameDialogContent } from "@/components/dashboard/dialogs/NameDialog";

interface RenameDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	itemId: string;
	currentName: string;
	type: "file" | "folder";
}

/**
 * Strips the extension from a file name (e.g. "report.pdf" → "report").
 * Returns the full name if there's no extension.
 */
const stripExtension = (name: string) => {
	const lastDot = name.lastIndexOf(".");
	return lastDot > 0 ? name.slice(0, lastDot) : name;
};

/** Returns dialog content text based on item type */
const getContent = (type: "file" | "folder"): NameDialogContent => {
	const label = type === "folder" ? "Folder" : "File";
	return {
		icon: Pencil,
		title: `Rename ${label}`,
		description: `Enter a new name for this ${type}.`,
		label: `${label} Name`,
		placeholder: `Enter ${type} name`,
		submitLabel: "Rename",
		pendingLabel: "Renaming...",
	};
};

/**
 * Dialog for renaming a file or folder.
 * For files, only the name part is editable — the extension is preserved.
 * Delegates UI to NameDialog and handles the rename mutation.
 */
const RenameDialog = ({
	open,
	onOpenChange,
	itemId,
	currentName,
	type,
}: RenameDialogProps) => {
	const queryClient = useQueryClient();
	const renameDir = useRenameDirectory();
	const renameFile = useRenameFile();

	const { mutate, isPending } = type === "folder" ? renameDir : renameFile;
	const content = useMemo(() => getContent(type), [type]);
	const schema = type === "folder" ? folderNameSchema : fileNameSchema;

	// For files, show only the name without extension in the input
	const displayName =
		type === "file" ? stripExtension(currentName) : currentName;

	const handleSubmit = (name: string) => {
		// Re-append the original extension for files (guard against no-extension files)
		const dotIndex = currentName.lastIndexOf(".");
		const extension = dotIndex > 0 ? currentName.slice(dotIndex) : "";
		const fullName = type === "file" ? `${name}${extension}` : name;

		const params =
			type === "folder"
				? { dirId: itemId, newDirName: fullName }
				: { fileId: itemId, newFileName: fullName };

		mutate(params as never, {
			onSuccess: () => {
				toast.success(`${type === "folder" ? "Folder" : "File"} renamed`);
				queryClient.invalidateQueries({ queryKey: ["directory"] });
				onOpenChange(false);
			},
			onError: (error) => {
				toast.error(error.message || "Failed to rename");
			},
		});
	};

	return (
		<NameDialog
			open={open}
			onOpenChange={onOpenChange}
			content={content}
			schema={schema}
			defaultValue={displayName}
			isPending={isPending}
			onSubmit={handleSubmit}
		/>
	);
};

export default RenameDialog;
