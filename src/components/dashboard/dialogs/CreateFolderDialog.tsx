//* src/components/dashboard/dialogs/CreateFolderDialog.tsx

import { useQueryClient } from "@tanstack/react-query";
import { FolderPlus } from "lucide-react";

import toast from "@/lib/toast";
import { useCreateDirectory } from "@/hooks/useDirectory";
import { folderNameSchema } from "@/schemas/itemName.schema";
import NameDialog from "@/components/dashboard/dialogs/NameDialog";
import type { NameDialogContent } from "@/components/dashboard/dialogs/NameDialog";

interface CreateFolderDialogProps {
	onClose: () => void;
	parentDirId?: string;
}

const dialogContent: NameDialogContent = {
	icon: FolderPlus,
	title: "Create New Folder",
	description: "Enter a name for the new folder.",
	label: "Folder Name",
	placeholder: "Enter folder name",
	submitLabel: "Create",
	pendingLabel: "Creating...",
};

/**
 * Dialog for creating a new folder in the current directory.
 * Delegates UI to NameDialog and handles the create mutation.
 */
const CreateFolderDialog = ({
	onClose,
	parentDirId,
}: CreateFolderDialogProps) => {
	const queryClient = useQueryClient();
	const { mutate, isPending } = useCreateDirectory();

	const handleSubmit = (name: string) => {
		mutate(
			{ name, parentDirId },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: ["directory"] });
					onClose();
				},
				onError: () => {
					toast.error("Couldn't create folder. Please try again.");
				},
			},
		);
	};

	return (
		<NameDialog
			onClose={onClose}
			content={dialogContent}
			schema={folderNameSchema}
			isPending={isPending}
			onSubmit={handleSubmit}
		/>
	);
};

export default CreateFolderDialog;
