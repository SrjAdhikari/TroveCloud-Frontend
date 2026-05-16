//* src/components/dashboard/sidebar/SidebarUserMenu.tsx

import { useState } from "react";
import { useNavigate } from "react-router";
import { Ellipsis, LogOut, Settings, ShieldUser } from "lucide-react";
import { useCurrentUser } from "@/hooks/useAuth";
import ROUTES from "@/routes/paths";
import isAdminRole from "@/lib/role";
import LogoutDialog from "@/components/dashboard/dialogs/LogoutDialog";

import {
	SidebarFooter,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
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
 * Sidebar footer with user avatar, info, and a dropdown menu
 * containing storage usage, settings, and logout actions.
 */
const SidebarUserMenu = () => {
	const navigate = useNavigate();
	const { data: userResponse } = useCurrentUser();
	const [logoutOpen, setLogoutOpen] = useState(false);

	const user = userResponse?.data;
	const isAdmin = isAdminRole(user?.role);

	return (
		<>
			<SidebarFooter className="border-t">
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton size="lg" tooltip={user?.name}>
									<Avatar className="size-8">
										<AvatarImage src={user?.profilePicture} alt={user?.name} />

										<AvatarFallback className="text-xs font-medium">
											{user?.name ? getInitials(user.name) : "?"}
										</AvatarFallback>
									</Avatar>

									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-medium">{user?.name}</p>

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
											className="h-full rounded-full bg-primary"
											style={{ width: "24%" }}
										/>
									</div>
								</div>

								<DropdownMenuSeparator />

								{/* Settings */}
								<DropdownMenuGroup>
									<DropdownMenuItem
										className="cursor-pointer"
										onSelect={() => navigate(ROUTES.SETTINGS)}
									>
										<Settings className="mr-2 size-4" />
										Settings
									</DropdownMenuItem>
								</DropdownMenuGroup>

								{/* Admin console — only visible to admin / superadmin */}
								{isAdmin && (
									<>
										<DropdownMenuSeparator />

										<DropdownMenuGroup>
											<DropdownMenuItem
												className="cursor-pointer"
												onSelect={() => navigate(ROUTES.ADMIN_OVERVIEW)}
											>
												<ShieldUser className="mr-2 size-4" />
												Admin Console
											</DropdownMenuItem>
										</DropdownMenuGroup>
									</>
								)}

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

			<LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
		</>
	);
};

export default SidebarUserMenu;
