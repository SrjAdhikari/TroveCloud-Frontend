//* src/components/dashboard/dialogs/NameDialog.tsx

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { LucideIcon } from "lucide-react";

import type { ZodObject, ZodString } from "zod/v4";

import type { NameFormData } from "@/schemas/itemName.schema";
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

/** Visual and text content for the dialog */
interface NameDialogContent {
	icon: LucideIcon;
	iconClassName?: string;
	iconBg?: string;
	title: string;
	description: string;
	label: string;
	placeholder: string;
	submitLabel: string;
	pendingLabel: string;
}

interface NameDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	content: NameDialogContent;
	schema: ZodObject<{ name: ZodString }>;
	defaultValue?: string;
	isPending: boolean;
	onSubmit: (name: string) => void;
}

/**
 * Reusable dialog for entering a name — used for creating and renaming files/folders.
 * Handles form state, Zod validation (3–50 chars), and reset on open/close.
 * The parent controls the mutation via onSubmit and isPending props.
 */
const NameDialog = ({
	open,
	onOpenChange,
	content,
	schema,
	defaultValue = "",
	isPending,
	onSubmit,
}: NameDialogProps) => {
	const {
		icon: Icon,
		iconClassName = "text-blue-500",
		iconBg = "bg-blue-500/10",
		title,
		description,
		label,
		placeholder,
		submitLabel,
		pendingLabel,
	} = content;

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<NameFormData>({
		mode: "onChange",
		resolver: zodResolver(schema),
		defaultValues: { name: defaultValue },
	});

	/** Reset form with default value whenever dialog opens/closes */
	useEffect(() => {
		if (open) {
			reset({ name: defaultValue });
		}
	}, [open, defaultValue, reset]);

	const handleFormSubmit = (data: NameFormData) => {
		onSubmit(data.name);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="min-w-xs max-w-xs sm:max-w-xs p-5 gap-4 max-sm:min-w-[calc(100%-2rem)]">
				<DialogHeader className="text-center gap-1">
					<div
						className={`mx-auto mb-1 flex size-10 items-center justify-center rounded-lg ${iconBg}`}
					>
						<Icon className={`size-5 ${iconClassName}`} />
					</div>

					<DialogTitle className="font-heading text-base font-medium">
						{title}
					</DialogTitle>
					<DialogDescription className="text-xs">
						{description}
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={handleSubmit(handleFormSubmit)}
					className="space-y-3"
				>
					<FormField
						label={label}
						id="name-input"
						placeholder={placeholder}
						autoFocus
						autoComplete="off"
						error={errors.name?.message}
						{...register("name")}
					/>

					<DialogFooter className="grid grid-cols-2 sm:grid sm:grid-cols-2 sm:justify-stretch">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => onOpenChange(false)}
							className="cursor-pointer"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							size="sm"
							disabled={isPending}
							className="cursor-pointer disabled:pointer-events-auto disabled:cursor-not-allowed"
						>
							{isPending ? pendingLabel : submitLabel}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export type { NameDialogContent };

export default NameDialog;
