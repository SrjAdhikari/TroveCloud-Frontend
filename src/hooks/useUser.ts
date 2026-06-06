//* src/hooks/useUser.ts

import { useMutation } from "@tanstack/react-query";
import { updateProfileName } from "@/api/users.api";

/**
 * Mutation hook for updating the user's display name
 */
const useUpdateProfileName = () => {
	return useMutation({ mutationFn: updateProfileName });
};

export { useUpdateProfileName };
