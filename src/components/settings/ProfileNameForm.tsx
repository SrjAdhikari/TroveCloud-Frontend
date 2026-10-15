//* src/components/settings/ProfileNameForm.tsx

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Check, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AlertBanner from "@/components/ui/alert-banner";
import {
	profileNameSchema,
	type ProfileNameFormData,
} from "@/schemas/profile.schema";
import { useUpdateProfileName } from "@/hooks/useUser";

/** Our messages for name-change errors, by error code. */
const NAME_ERROR_COPY: Record<string, string> = {
	VALIDATION_ERROR: "Name must be 3–50 characters.",
};

const GENERIC_NAME_ERROR = "Couldn't update your name. Please try again.";

interface ProfileNameFormProps {
	currentName: string;
}

/**
 * The editable name field. A Save button appears inside the field once the
 * name changes.
 */
const ProfileNameForm = ({ currentName }: ProfileNameFormProps) => {
	const { mutate, isPending } = useUpdateProfileName();
	const queryClient = useQueryClient();
	const [serverError, setServerError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isValid, isDirty },
	} = useForm<ProfileNameFormData>({
		mode: "onChange",
		resolver: zodResolver(profileNameSchema),
		defaultValues: { name: currentName },
	});

	const onSubmit = ({ name }: ProfileNameFormData) => {
		setServerError(null);
		mutate(name, {
			onSuccess: (response) => {
				// Save the new user data so the name updates everywhere at once.
				queryClient.setQueryData(["currentUser"], response);
				reset({ name: response.data.name });
			},
			onError: (error) => {
				setServerError(NAME_ERROR_COPY[error.code] ?? GENERIC_NAME_ERROR);
			},
		});
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-2">
			<Label htmlFor="name">Name</Label>

			<div className="relative">
				<Input
					id="name"
					type="text"
					autoComplete="off"
					placeholder="Enter your name"
					aria-invalid={!!errors.name}
					aria-describedby={errors.name ? "name-error" : undefined}
					className="pr-24"
					{...register("name")}
				/>

				{/* Save button, shown only once the name has changed */}
				{isDirty && (
					<Button
						type="submit"
						size="sm"
						aria-label="Save"
						disabled={isPending || !isValid}
						className="absolute right-2 top-1/2 h-7 -translate-y-1/2 cursor-pointer px-3 disabled:cursor-not-allowed"
					>
						{isPending ? (
							<LoaderCircle className="size-4 animate-spin" />
						) : (
							<Check className="size-4" />
						)}
					</Button>
				)}
			</div>

			{errors.name && (
				<span id="name-error" className="text-sm text-destructive">
					{errors.name.message}
				</span>
			)}

			{serverError && <AlertBanner variant="error">{serverError}</AlertBanner>}
		</form>
	);
};

export default ProfileNameForm;
