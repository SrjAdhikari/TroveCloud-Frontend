//* src/components/dashboard/dialogs/LogoutDialog.tsx

import { LogOut } from "lucide-react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useLogout, useLogoutAll } from "@/hooks/useAuth";
import ROUTES from "@/routes/paths";
import type { ApiError } from "@/types/api.types";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface LogoutDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

/**
 * Confirmation dialog for logging out.
 * Offers two actions: log out the current session, or log out everywhere (all devices).
 * On success, invalidates the currentUser query and redirects to / (sign in).
 */
const LogoutDialog = ({ open, onOpenChange }: LogoutDialogProps) => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { mutate: logoutMutate, isPending: isLoggingOut } = useLogout();
	const { mutate: logoutAllMutate, isPending: isLoggingOutAll } =
		useLogoutAll();

	const isPending = isLoggingOut || isLoggingOutAll;

	// Shared success handler — clears cached user data and redirects to login.
	const handleSuccess = (message: string) => {
		queryClient.removeQueries({ queryKey: ["currentUser"] });
		queryClient.removeQueries({ queryKey: ["directory"] });

		onOpenChange(false);
		navigate(ROUTES.ROOT);
		toast.success(message);
	};

	// Error handler — shows toast with the error message.
	const handleError = (error: ApiError) => {
		toast.error(error.message || "Failed to log out");
	};

	// Logout handler — calls the logout mutation.
	const handleLogout = () => {
		logoutMutate(undefined, {
			onSuccess: () => handleSuccess("Logged out successfully"),
			onError: handleError,
		});
	};

	// Logout all handler — calls the logout all mutation.
	const handleLogoutAll = () => {
		logoutAllMutate(undefined, {
			onSuccess: () => handleSuccess("Logged out of all devices successfully"),
			onError: handleError,
		});
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent
				size="sm"
				className="min-w-xs max-w-xs p-5 gap-2 max-sm:min-w-[calc(100%-2rem)]"
			>
				<AlertDialogHeader className="text-center pb-3">
					{/* Logout icon */}
					<div className="mx-auto mb-1 flex size-10 items-center justify-center rounded-lg bg-destructive/10">
						<LogOut className="size-5 text-destructive" />
					</div>

					<AlertDialogTitle className="font-heading text-base font-medium">
						Log out of TroveCloud
					</AlertDialogTitle>

					<AlertDialogDescription className="text-xs">
						Are you sure you want to log out?
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter className="grid grid-cols-2 sm:grid sm:grid-cols-2 sm:justify-stretch">
					<AlertDialogCancel
						size="sm"
						className="cursor-pointer"
						disabled={isPending}
					>
						Cancel
					</AlertDialogCancel>

					<AlertDialogAction
						onClick={handleLogout}
						size="sm"
						disabled={isPending}
						className="cursor-pointer"
					>
						{isLoggingOut ? "Logging out..." : "Log out"}
					</AlertDialogAction>
				</AlertDialogFooter>

				<Button
					variant="ghost"
					size="sm"
					onClick={handleLogoutAll}
					disabled={isPending}
					className="w-full cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
				>
					{isLoggingOutAll ? "Logging out..." : "Log out everywhere"}
				</Button>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default LogoutDialog;
