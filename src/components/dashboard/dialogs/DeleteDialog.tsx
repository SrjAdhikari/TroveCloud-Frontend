//* src/components/dashboard/dialogs/DeleteDialog.tsx

import { Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import toast from "@/lib/toast";
import { useDeleteDirectory } from "@/hooks/useDirectory";
import { useDeleteFile } from "@/hooks/useFile";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteDialogProps {
	onClose: () => void;
	itemId: string;
	itemName: string;
	type: "file" | "folder";
}

/**
 * Confirmation dialog before deleting a file or folder.
 * Centered layout with a trash icon, item name, and side-by-side buttons.
 * Folders are deleted recursively (all nested contents).
 */
const DeleteDialog = ({
	onClose,
	itemId,
	itemName,
	type,
}: DeleteDialogProps) => {
	const queryClient = useQueryClient();
	const deleteDir = useDeleteDirectory();
	const deleteFile = useDeleteFile();

	const { mutate, isPending } = type === "folder" ? deleteDir : deleteFile;

	const handleDelete = () => {
		mutate(itemId, {
			onSuccess: () => {
				toast.success(`${type === "folder" ? "Folder" : "File"} deleted`);
				queryClient.invalidateQueries({ queryKey: ["directory"] });
				onClose();
			},
			onError: () => {
				toast.error("Couldn't delete. Please try again.");
			},
		});
	};

	return (
		<AlertDialog open onOpenChange={(isOpen) => !isOpen && onClose()}>
			<AlertDialogContent
				size="sm"
				className="min-w-xs max-w-xs p-5 gap-4 max-sm:min-w-[calc(100%-2rem)] bg-background"
			>
				<AlertDialogHeader className="text-center">
					{/* Trash icon */}
					<div className="mx-auto mb-1 flex size-10 items-center justify-center rounded-lg bg-destructive/10">
						<Trash2 aria-hidden="true" className="size-5 text-destructive" />
					</div>

					<AlertDialogTitle className="font-heading text-base font-medium">
						Delete {type === "folder" ? "folder" : "file"}?
					</AlertDialogTitle>

					<AlertDialogDescription className="text-xs">
						This will permanently delete{" "}
						<span className="font-medium text-foreground">{itemName}</span>.
						{type === "folder" &&
							" All files and folders inside will also be deleted."}
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter className="grid grid-cols-2 sm:grid sm:grid-cols-2 sm:justify-stretch">
					<AlertDialogCancel size="sm" className="cursor-pointer">
						Cancel
					</AlertDialogCancel>

					<AlertDialogAction
						onClick={handleDelete}
						variant="destructive"
						size="sm"
						disabled={isPending}
						className="cursor-pointer"
					>
						{isPending ? "Deleting..." : "Delete"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default DeleteDialog;
