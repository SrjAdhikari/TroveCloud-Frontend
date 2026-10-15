//* src/hooks/usePostLogout.ts

import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

import toast from "@/lib/toast";
import ROUTES from "@/routes/paths";

/**
 * Clears saved user data before going to sign-in. Otherwise the sign-in page
 * could still think the user is logged in and send them back.
 */
const usePostLogout = () => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return (message: string) => {
		queryClient.removeQueries({ queryKey: ["currentUser"] });
		queryClient.removeQueries({ queryKey: ["directory"] });
		queryClient.removeQueries({ queryKey: ["storageUsage"] });
		navigate(ROUTES.ROOT);
		toast.success(message);
	};
};

export default usePostLogout;
