//* src/components/dashboard/sidebar/SidebarNewButton.tsx

import { FolderPlus, FolderUp, Plus, Upload } from "lucide-react";

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

						<DropdownMenuItem className="cursor-pointer" disabled>
							<svg
								viewBox="0 0 48 48"
								fill="none"
								stroke="currentColor"
								strokeWidth="3"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="mr-2 size-4"
							>
								<path d="M18.15,7.11,4.5,30.75l5.85,10.14h27.3L43.5,30.75,29.85,7.11Z" />
								<line x1="4.5" y1="30.75" x2="31.79" y2="30.75" />
								<line x1="37.65" y1="40.89" x2="24" y2="17.25" />
								<line x1="29.85" y1="7.11" x2="16.21" y2="30.75" />
							</svg>
							Import from Drive
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
};

export default SidebarNewButton;
