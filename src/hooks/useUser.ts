//* src/hooks/useUser.ts

import { useMutation } from "@tanstack/react-query";
import { updateProfileName, uploadProfilePicture } from "@/api/users.api";

export const useUpdateProfileName = () => {
	return useMutation({ mutationFn: updateProfileName });
};

export const useUploadProfilePicture = () => {
	return useMutation({ mutationFn: uploadProfilePicture });
};
