//* src/components/settings/ProfileAvatarUpload.tsx

import { useRef, useState } from "react";
import { Camera, LoaderCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import getInitials from "@/lib/getInitials";
import toast from "@/lib/toast";
import validateImageFile from "@/lib/validateImageFile";
import { ACCEPTED_IMAGE_TYPES } from "@/lib/constants";

import type { UserPayload } from "@/types/auth.types";
import { useUploadProfilePicture } from "@/hooks/useUser";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import FieldError from "@/components/ui/field-error";

const PICTURE_ERROR_COPY: Record<string, string> = {
	INVALID_IMAGE_TYPE: "Please choose a JPEG, PNG, or WEBP image.",
	IMAGE_TOO_LARGE: "Image is too large. Please choose one under 2 MB.",
};

const GENERIC_PICTURE_ERROR = "Couldn't upload your photo. Please try again.";

interface ProfileAvatarUploadProps {
	user: UserPayload;
}

/**
 * Avatar with click-to-upload. On pick the file is validated client-side
 * (type/size) before any request; a valid file uploads immediately.
 */
const ProfileAvatarUpload = ({ user }: ProfileAvatarUploadProps) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const { mutate, isPending } = useUploadProfilePicture();
	const queryClient = useQueryClient();

	// Trigger the hidden file input when the user clicks the avatar or button.
	const openPicker = () => inputRef.current?.click();

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		// Reset the input so picking the same file again still fires onChange.
		event.target.value = "";
		if (!file) return;

		setUploadError(null);

		const validation = validateImageFile(file);
		if (!validation.ok) {
			setUploadError(PICTURE_ERROR_COPY[validation.code]);
			return;
		}

		mutate(file, {
			onSuccess: (response) => {
				// Cache the returned user so the avatar/sidebar swap without a refetch
				queryClient.setQueryData(["currentUser"], response);
			},
			onError: (error) => {
				setUploadError(PICTURE_ERROR_COPY[error.code] ?? GENERIC_PICTURE_ERROR);
				if (!(error.code in PICTURE_ERROR_COPY)) {
					toast.error(GENERIC_PICTURE_ERROR);
				}
			},
		});
	};

	return (
		<div className="flex items-center gap-5">
			<div className="relative group">
				<Avatar className="size-20">
					<AvatarImage src={user.profilePicture ?? undefined} alt={user.name} />
					<AvatarFallback className="text-xl font-medium">
						{getInitials(user.name) || "?"}
					</AvatarFallback>
				</Avatar>

				{/* Mouse-only enhancement: click-the-avatar mirrors the "Upload photo"
				  button. tabIndex=-1 keeps it out of the keyboard tab order so
				  keyboard/SR users get a single control (the button below). */}
				<button
					type="button"
					tabIndex={-1}
					onClick={openPicker}
					disabled={isPending}
					aria-label="Change profile picture"
					className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer disabled:cursor-not-allowed"
				>
					{isPending ? (
						<LoaderCircle className="size-5 animate-spin text-white" />
					) : (
						<Camera className="size-5 text-white" />
					)}
				</button>

				<input
					ref={inputRef}
					type="file"
					accept={ACCEPTED_IMAGE_TYPES.join(",")}
					aria-label="Upload profile picture"
					onChange={handleChange}
					className="hidden"
				/>
			</div>

			<div>
				<p className="text-sm font-medium">{user.name}</p>
				<p className="text-xs text-muted-foreground">{user.email}</p>

				<Button
					variant="outline"
					size="sm"
					onClick={openPicker}
					disabled={isPending}
					className="mt-3 cursor-pointer disabled:cursor-not-allowed"
				>
					{isPending ? "Uploading..." : "Upload photo"}
				</Button>

				<FieldError message={uploadError ?? undefined} className="mt-2" />
			</div>
		</div>
	);
};

export default ProfileAvatarUpload;
