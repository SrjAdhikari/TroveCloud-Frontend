//* src/components/dashboard/sidebar/SidebarUserMenu.tsx

import { useNavigate } from "react-router";
import { Ellipsis, LogOut, Settings, ShieldUser } from "lucide-react";

import { useCurrentUser, useLogout } from "@/hooks/useAuth";
import usePostLogout from "@/hooks/usePostLogout";
import useStorageUsage from "@/hooks/useStorageUsage";

import ROUTES from "@/routes/paths";

import toast from "@/lib/toast";
import isAdminRole from "@/lib/role";
import getInitials from "@/lib/getInitials";
import { formatBytes } from "@/lib/formatters";
import { getUsagePercent, getUsageBarColor } from "@/lib/storage";

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
 * Sidebar footer with user avatar, info, and a dropdown menu
 * containing storage usage, settings, and logout actions.
 */
const SidebarUserMenu = () => {
	const navigate = useNavigate();

	const { data: userResponse } = useCurrentUser();
	const { data: storageResponse } = useStorageUsage();

	const usage = storageResponse?.data;
	const usagePercent = usage ? getUsagePercent(usage.used, usage.total) : 0;

	const { mutate: logout, isPending: isLoggingOut } = useLogout();
	const handlePostLogout = usePostLogout();

	const handleLogout = () => {
		if (isLoggingOut) return;
		logout(undefined, {
			onSuccess: () => handlePostLogout("Logged out successfully"),
			onError: () => {
				toast.error("Couldn't log out. Please try again.");
			},
		});
	};

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
										<AvatarImage
											src={user?.profilePicture ?? undefined}
											alt={user?.name}
										/>

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
												src={user?.profilePicture ?? undefined}
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

								{/* Storage usage */}
								{usage && (
									<>
										<div className="px-3 py-2">
											<div className="flex items-center justify-between text-xs text-muted-foreground">
												<span>Storage</span>
												<span>
													{`${formatBytes(usage.used)} / ${formatBytes(usage.total)}`}
												</span>
											</div>

											<div
												className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted"
												role="progressbar"
												aria-valuenow={usagePercent}
												aria-valuemin={0}
												aria-valuemax={100}
												aria-label={`Storage used: ${formatBytes(usage.used)} of ${formatBytes(usage.total)}`}
											>
												<div
													className={`h-full rounded-full ${getUsageBarColor(usagePercent)}`}
													style={{ width: `${usagePercent}%` }}
												/>
											</div>
										</div>

										<DropdownMenuSeparator />
									</>
								)}

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
										onSelect={handleLogout}
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
		</>
	);
};

export default SidebarUserMenu;
