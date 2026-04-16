//* src/components/layout/DashboardLayout.tsx

import { useState } from "react";
import { Outlet } from "react-router";
import { Cloud, Ellipsis, FolderClosed, LogOut, Settings } from "lucide-react";
import { useCurrentUser } from "@/hooks/useAuth";
import LogoutDialog from "@/components/dashboard/dialogs/LogoutDialog";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarRail,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ThemeToggle from "@/components/theme/theme-toggle";

/**
 * Extracts up to two initials from a user's name for the avatar fallback.
 * e.g., "Suraj Adhikari" → "SA", "suraj" → "SU"
 */
const getInitials = (name: string) => {
	const parts = name.trim().split(/\s+/);
	if (parts.length >= 2) {
		return (parts[0][0] + parts[1][0]).toUpperCase();
	}
	return name.slice(0, 2).toUpperCase();
};

/**
 * Main dashboard layout — sidebar + content area.
 * Used as a layout route in React Router — pages render via <Outlet />.
 * On mobile, the sidebar collapses into a slide-out sheet.
 * Sidebar uses collapsible="icon" to show only icons when collapsed.
 */
const DashboardLayout = () => {
	const { data: userResponse } = useCurrentUser();
	const [logoutOpen, setLogoutOpen] = useState(false);

	const user = userResponse?.data;

	return (
		<SidebarProvider>
			<Sidebar collapsible="icon">
				{/* Logo */}
				<SidebarHeader>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton
								size="lg"
								tooltip="TroveCloud"
								className="hover:bg-transparent active:bg-transparent cursor-default"
							>
								<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white">
									<Cloud className="size-5" />
								</div>

								<span className="text-lg font-semibold text-blue-500">
									TroveCloud
								</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarHeader>

				{/* Navigation */}
				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupLabel>Browse</SidebarGroupLabel>

						<SidebarGroupContent>
							<SidebarMenu>
								<SidebarMenuItem>
									<SidebarMenuButton isActive tooltip="My Files">
										<FolderClosed />
										<span>My Files</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>

				{/* User menu with dropdown */}
				<SidebarFooter className="border-t">
					<SidebarMenu>
						<SidebarMenuItem>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<SidebarMenuButton
										size="lg"
										tooltip={user?.name}
										className="group-data-[collapsible=icon]:rounded-full"
									>
										<Avatar className="size-8">
											<AvatarImage
												src={user?.profilePicture}
												alt={user?.name}
											/>

											<AvatarFallback className="text-xs font-medium">
												{user?.name ? getInitials(user.name) : "?"}
											</AvatarFallback>
										</Avatar>

										<div className="min-w-0 flex-1">
											<p className="truncate text-sm font-medium">
												{user?.name}
											</p>

											<p className="truncate text-xs text-muted-foreground">
												{user?.email}
											</p>
										</div>

										<Ellipsis className="ml-auto size-4 text-muted-foreground cursor-pointer" />
									</SidebarMenuButton>
								</DropdownMenuTrigger>

								<DropdownMenuContent
									className="w-[calc(var(--radix-dropdown-menu-trigger-width)-0.5rem)] min-w-56"
									side="top"
									align="center"
									sideOffset={16}
								>
									{/* User info */}
									<DropdownMenuLabel className="font-normal">
										<div className="flex items-center gap-3 px-1 py-1">
											<Avatar className="size-8">
												<AvatarImage
													src={user?.profilePicture}
													alt={user?.name}
												/>

												<AvatarFallback className="text-xs font-medium">
													{user?.name ? getInitials(user.name) : "?"}
												</AvatarFallback>
											</Avatar>

											<div className="min-w-0">
												<p className="truncate text-sm font-medium">
													{user?.name}
												</p>

												<p className="truncate text-xs text-muted-foreground">
													{user?.email}
												</p>
											</div>
										</div>
									</DropdownMenuLabel>

									<DropdownMenuSeparator />

									{/* TODO: Replace hardcoded values with real storage data once backend supports it */}
									<div className="px-3 py-2">
										<div className="flex items-center justify-between text-xs text-muted-foreground">
											<span>Storage</span>
											<span>2.4 / 10 GB</span>
										</div>

										<div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
											<div
												className="h-full rounded-full bg-blue-500"
												style={{ width: "24%" }}
											/>
										</div>
									</div>

									<DropdownMenuSeparator />

									{/* Settings */}
									<DropdownMenuGroup>
										<DropdownMenuItem className="cursor-pointer">
											<Settings className="mr-2 size-4" />
											Settings
										</DropdownMenuItem>
									</DropdownMenuGroup>

									<DropdownMenuSeparator />

									{/* Logout */}
									<DropdownMenuGroup>
										<DropdownMenuItem
											className="cursor-pointer"
											onSelect={() => setLogoutOpen(true)}
										>
											<LogOut className="mr-2 size-4" />
											Log out
										</DropdownMenuItem>
									</DropdownMenuGroup>
								</DropdownMenuContent>
							</DropdownMenu>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarFooter>

				<SidebarRail />
			</Sidebar>

			{/* Main content area */}
			<SidebarInset>
				{/* Top header bar */}
				<header className="flex h-14 items-center gap-3 border-b px-4">
					<SidebarTrigger />
					<div className="flex-1" />
					<ThemeToggle />
				</header>

				{/* Page content */}
				<div className="flex-1 overflow-auto p-6">
					<Outlet />
				</div>
			</SidebarInset>

			<LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
		</SidebarProvider>
	);
};

export default DashboardLayout;
