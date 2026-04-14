//* src/components/dashboard/CreateFolderDialog.tsx

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
	folderNameSchema,
	type FolderNameFormData,
} from "@/schemas/directory.schema";
import { useCreateDirectory } from "@/hooks/useDirectory";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormField from "@/components/form/FormField";

interface CreateFolderDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	parentDirId?: string;
}

/**
 * Dialog for creating a new folder in the current directory.
 * Uses React Hook Form + Zod for validation and useCreateDirectory mutation.
 * Invalidates the directory query on success to refresh the listing.
 */
const CreateFolderDialog = ({
	open,
	onOpenChange,
	parentDirId,
}: CreateFolderDialogProps) => {
	const queryClient = useQueryClient();
	const { mutate, isPending } = useCreateDirectory();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<FolderNameFormData>({
		mode: "onChange",
		resolver: zodResolver(folderNameSchema),
	});

	/** Reset form when dialog opens/closes */
	useEffect(() => {
		if (!open) reset();
	}, [open, reset]);

	const onSubmit = (data: FolderNameFormData) => {
		mutate(
			{ name: data.name, parentDirId },
			{
				onSuccess: (res) => {
					toast.success(res.message || "Folder created");
					queryClient.invalidateQueries({
						queryKey: ["directory"],
					});
					onOpenChange(false);
				},
				onError: (error) => {
					toast.error(error.message || "Failed to create folder");
				},
			},
		);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="top-[40%] sm:max-w-sm">
				<DialogHeader className="text-center gap-1">
					<DialogTitle className="font-heading text-lg font-medium">
						Create New Folder
					</DialogTitle>
					<DialogDescription>
						Enter a name for the new folder.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						label="Folder Name"
						id="folder-name"
						placeholder="Enter folder name"
						autoFocus
						autoComplete="off"
						error={errors.name?.message}
						{...register("name")}
					/>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							className="cursor-pointer"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isPending}
							className="cursor-pointer disabled:pointer-events-auto disabled:cursor-not-allowed"
						>
							{isPending ? "Creating..." : "Create"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default CreateFolderDialog;
