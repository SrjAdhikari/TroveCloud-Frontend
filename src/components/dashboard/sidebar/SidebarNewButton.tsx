//* src/components/dashboard/sidebar/SidebarNewButton.tsx

import { FolderPlus, FolderUp, Plus, Upload } from "lucide-react";

import DriveIcon from "@/components/icons/DriveIcon";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Dispatches a custom event to trigger an action in DashboardPage */
const dispatchAction = (action: string) => {
	window.dispatchEvent(new CustomEvent("dashboard:action", { detail: action }));
};

/**
 * "New" button in the sidebar that opens a dropdown with creation actions.
 * Communicates with DashboardPage via custom DOM events to open dialogs.
 */
const SidebarNewButton = () => {
	return (
		<SidebarMenu className="px-2 pt-3 pb-2">
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							tooltip="New"
							className="justify-center text-primary-foreground hover:text-primary-foreground bg-primary hover:bg-primary/80 transition-colors duration-300"
						>
							<Plus strokeWidth={2.5} />
							<span className="text-base font-medium">New</span>
						</SidebarMenuButton>
					</DropdownMenuTrigger>

					<DropdownMenuContent
						className="w-[calc(var(--radix-dropdown-menu-trigger-width)-0.5rem)] min-w-56"
						side="bottom"
						align="center"
						sideOffset={8}
					>
						<DropdownMenuItem
							className="cursor-pointer"
							onSelect={() => dispatchAction("new-folder")}
						>
							<FolderPlus className="mr-2 size-4" />
							New Folder
						</DropdownMenuItem>

						<DropdownMenuItem
							className="cursor-pointer"
							onSelect={() => dispatchAction("upload-files")}
						>
							<Upload className="mr-2 size-4" />
							Upload Files
						</DropdownMenuItem>

						<DropdownMenuSeparator />

						<DropdownMenuItem className="cursor-pointer" disabled>
							<FolderUp className="mr-2 size-4" />
							Upload Folder
						</DropdownMenuItem>

						<DropdownMenuItem
							className="cursor-pointer"
							onSelect={() => dispatchAction("import-from-drive")}
						>
							<DriveIcon className="mr-2 size-4" aria-hidden="true" />
							Import from Drive
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
};

export default SidebarNewButton;
