//* src/components/dashboard/dialogs/CreateFolderDialog.tsx

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FolderPlus } from "lucide-react";

import { useCreateDirectory } from "@/hooks/useDirectory";
import { folderNameSchema } from "@/schemas/itemName.schema";
import NameDialog from "@/components/dashboard/dialogs/NameDialog";
import type { NameDialogContent } from "@/components/dashboard/dialogs/NameDialog";

interface CreateFolderDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
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
	open,
	onOpenChange,
	parentDirId,
}: CreateFolderDialogProps) => {
	const queryClient = useQueryClient();
	const { mutate, isPending } = useCreateDirectory();

	const handleSubmit = (name: string) => {
		mutate(
			{ name, parentDirId },
			{
				onSuccess: (res) => {
					toast.success(res.message || "Folder created");
					queryClient.invalidateQueries({ queryKey: ["directory"] });
					onOpenChange(false);
				},
				onError: (error) => {
					toast.error(error.message || "Failed to create folder");
				},
			},
		);
	};

	return (
		<NameDialog
			open={open}
			onOpenChange={onOpenChange}
			content={dialogContent}
			schema={folderNameSchema}
			isPending={isPending}
			onSubmit={handleSubmit}
		/>
	);
};

export default CreateFolderDialog;
