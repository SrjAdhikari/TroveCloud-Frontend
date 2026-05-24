//* src/hooks/usePostLogout.ts

import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

import toast from "@/lib/toast";
import ROUTES from "@/routes/paths";

/**
 * Shared cleanup run after any successful logout. Clears the auth/data caches
 * BEFORE navigating to the guest sign-in route so the guest guard doesn't read
 * a stale authenticated user (feedback_invalidate_before_navigate).
 */
const usePostLogout = () => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return (message: string) => {
		queryClient.removeQueries({ queryKey: ["currentUser"] });
		queryClient.removeQueries({ queryKey: ["directory"] });
		navigate(ROUTES.ROOT);
		toast.success(message);
	};
};

export default usePostLogout;
