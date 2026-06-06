//* src/api/users.api.ts

import axiosClient from "@/config/axiosClient";
import type { ApiSuccessResponse } from "@/types/api.types";
import type { UserPayload } from "@/types/auth.types";

/**
 * Updates the signed-in user's display name.
 */
const updateProfileName = async (name: string) => {
	const { data } = await axiosClient.patch<ApiSuccessResponse<UserPayload>>(
		"/users/profile",
		{ name },
	);
	return data;
};

/**
 * Uploads (or replaces) the signed-in user's profile picture.
 */
const uploadProfilePicture = async (file: File) => {
	const { data } = await axiosClient.post<ApiSuccessResponse<UserPayload>>(
		"/users/profile-picture",
		file,
		{ headers: { "Content-Type": file.type } },
	);
	return data;
};

export { updateProfileName, uploadProfilePicture };
