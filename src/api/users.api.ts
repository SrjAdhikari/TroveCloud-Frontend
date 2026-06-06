//* src/api/users.api.ts

import axiosClient from "@/config/axiosClient";
import type { ApiSuccessResponse } from "@/types/api.types";
import type { UserPayload } from "@/types/auth.types";

/**
 * Updates the signed-in user's display name. Returns the full current-user
 * object (same shape as GET /auth/me) so it can be dropped into the cache.
 */
const updateProfileName = async (name: string) => {
	const { data } = await axiosClient.patch<ApiSuccessResponse<UserPayload>>(
		"/users/profile",
		{ name },
	);
	return data;
};

export { updateProfileName };
