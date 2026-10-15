//* src/components/dashboard/dialogs/RenameDialog.tsx

import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";

import toast from "@/lib/toast";
import { useRenameDirectory } from "@/hooks/useDirectory";
import { useRenameFile } from "@/hooks/useFile";
import { folderNameSchema, fileNameSchema } from "@/schemas/itemName.schema";
import NameDialog from "@/components/dashboard/dialogs/NameDialog";
import type { NameDialogContent } from "@/components/dashboard/dialogs/NameDialog";

interface RenameDialogProps {
	onClose: () => void;
	itemId: string;
	currentName: string;
	type: "file" | "folder";
}

/** "report.pdf" → "report". A name with no extension is returned as is. */
const stripExtension = (name: string) => {
	const lastDot = name.lastIndexOf(".");
	return lastDot > 0 ? name.slice(0, lastDot) : name;
};

/** The dialog's icon and text for a file or a folder. */
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
 * Renames a file or folder. For files, only the part before the extension
 * can be edited; the extension is kept.
 */
const RenameDialog = ({
	onClose,
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

	// For files, the input shows the name without its extension.
	const displayName =
		type === "file" ? stripExtension(currentName) : currentName;

	const handleSubmit = (name: string) => {
		// Add the original extension back (if the file had one).
		const dotIndex = currentName.lastIndexOf(".");
		const extension = dotIndex > 0 ? currentName.slice(dotIndex) : "";
		const fullName = type === "file" ? `${name}${extension}` : name;

		const params =
			type === "folder"
				? { dirId: itemId, newDirName: fullName }
				: { fileId: itemId, newFileName: fullName };

		mutate(params as never, {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["directory"] });
				onClose();
			},
			onError: () => {
				toast.error(
					`Couldn't rename ${type}. Please try again.`,
				);
			},
		});
	};

	return (
		<NameDialog
			onClose={onClose}
			content={content}
			schema={schema}
			defaultValue={displayName}
			isPending={isPending}
			onSubmit={handleSubmit}
		/>
	);
};

export default RenameDialog;
