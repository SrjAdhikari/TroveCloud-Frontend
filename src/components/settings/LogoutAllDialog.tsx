//* src/components/settings/LogoutAllDialog.tsx

import { LogOut } from "lucide-react";

import toast from "@/lib/toast";
import { useLogoutAll } from "@/hooks/useAuth";
import usePostLogout from "@/hooks/usePostLogout";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface LogoutAllDialogProps {
	onClose: () => void;
}

/**
 * Confirmation before logging out of every device. High-impact (it ends the
 * current session too), so it always confirms. Parent-conditionally mounted.
 */
const LogoutAllDialog = ({ onClose }: LogoutAllDialogProps) => {
	const { mutate, isPending } = useLogoutAll();
	const handlePostLogout = usePostLogout();

	const handleConfirm = () => {
		if (isPending) return;
		mutate(undefined, {
			onSuccess: () =>
				handlePostLogout("Logged out of all devices successfully"),
			onError: () => {
				toast.error("Couldn't log out of all devices. Please try again.");
			},
		});
	};

	return (
		<AlertDialog open onOpenChange={(isOpen) => !isOpen && onClose()}>
			<AlertDialogContent
				size="sm"
				className="min-w-xs max-w-xs p-5 gap-4 max-sm:min-w-[calc(100%-2rem)] bg-background"
			>
				<AlertDialogHeader className="text-center">
					<div className="mx-auto mb-1 flex size-10 items-center justify-center rounded-lg bg-destructive/10">
						<LogOut aria-hidden="true" className="size-5 text-destructive" />
					</div>

					<AlertDialogTitle className="font-heading text-base font-medium">
						Log out of all devices?
					</AlertDialogTitle>

					<AlertDialogDescription className="text-xs">
						You'll be signed out everywhere and need to sign in again.
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

					<Button
						onClick={handleConfirm}
						variant="destructive"
						size="sm"
						disabled={isPending}
						className="cursor-pointer"
					>
						{isPending ? "Logging out..." : "Log out everywhere"}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default LogoutAllDialog;
