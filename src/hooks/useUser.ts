//* src/hooks/useUser.ts

import { useMutation } from "@tanstack/react-query";
import { updateProfileName, uploadProfilePicture } from "@/api/users.api";

/**
 * Mutation hook for updating the user's display name
 */
const useUpdateProfileName = () => {
	return useMutation({ mutationFn: updateProfileName });
};

/**
 * Mutation hook for uploading/replacing the user's profile picture
 */
const useUploadProfilePicture = () => {
	return useMutation({ mutationFn: uploadProfilePicture });
};

export { useUpdateProfileName, useUploadProfilePicture };
